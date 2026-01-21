/**
 * AudioButton Component
 * Reproduz a pronúncia da palavra via URL do áudio
 * Implementa feedback visual completo (loading, playing, erro)
 */

import React, { useState, useRef } from "react";
import { Pressable, View, Text, ActivityIndicator } from "react-native";
import { Audio } from "expo-av";

// Type augmentation para NativeWind className
declare module "react-native" {
  interface ViewProps {
    className?: string;
  }
  interface PressableProps {
    className?: string;
  }
  interface TextProps {
    className?: string;
  }
}

/**
 * Props do componente AudioButton
 */
interface AudioButtonProps {
  /** URL do arquivo de áudio (MP3) */
  audioUrl?: string;
  /** Callback ao iniciar reprodução */
  onPress?: () => void;
  /** Se deve desabilitar o botão */
  disabled?: boolean;
}

/**
 * AudioButton - Componente reutilizável para reprodução de áudio
 *
 * Características:
 * - Carrega e reproduz áudio via URL
 * - Feedback visual durante carregamento e reprodução
 * - Tratamento completo de erros
 * - Fallback quando não há URL ou conexão
 * - Responsividade e acessibilidade
 */
export const AudioButton: React.FC<AudioButtonProps> = ({
  audioUrl,
  onPress,
  disabled = false,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  // Determina os estados do botão
  const isDisabled = disabled || !audioUrl || isLoading;
  const isActive = isPlaying;

  /**
   * Limpa o som anterior e para reprodução
   */
  const cleanupSound = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    } catch (err) {
      console.error("Erro ao descarregar áudio:", err);
    }
  };

  /**
   * Reproduz o áudio da URL fornecida
   */
  const handlePlayAudio = async () => {
    try {
      // Validações
      if (!audioUrl) {
        setError("URL de áudio não disponível");
        return;
      }

      if (disabled) return;

      // Callback customizado
      onPress?.();

      // Se já está tocando, para
      if (isPlaying) {
        await cleanupSound();
        setIsPlaying(false);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      // Carrega e reproduz o áudio
      const sound = new Audio.Sound();
      soundRef.current = sound;

      try {
        // Validar e normalizar URL
        if (!audioUrl || audioUrl.trim() === "") {
          setError("URL de áudio inválida");
          setIsLoading(false);
          return;
        }

        console.log("[AudioButton] Tentando carregar áudio:", audioUrl);

        // Configurar modo de áudio (apenas para iOS/Android)
        if (Audio.setAudioModeAsync) {
          try {
            await Audio.setAudioModeAsync({
              allowsRecordingIOS: false,
              playsInSilentModeIOS: true,
              shouldDuckAndroid: true,
              staysActiveInBackground: false,
            });
          } catch (modeError) {
            // Ignore mode setting errors (common on web)
            console.debug("Não foi possível configurar modo de áudio (web?)");
          }
        }

        // Carrega o áudio com timeout
        const loadPromise = sound.loadAsync({ uri: audioUrl });
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("Timeout ao carregar áudio (10s)")),
            10000,
          ),
        );

        await Promise.race([loadPromise, timeoutPromise]);
        console.log("[AudioButton] Áudio carregado com sucesso");

        // Define evento para quando terminar
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            setIsPlaying(false);
          }
        });

        // Reproduz
        await sound.playAsync();
        console.log("[AudioButton] Reprodução iniciada com sucesso");
        setIsPlaying(true);
        setIsLoading(false);
      } catch (loadError) {
        setIsLoading(false);
        const errorMessage =
          loadError instanceof Error
            ? loadError.message
            : "Erro ao carregar áudio";
        setError(errorMessage);
        console.error("[AudioButton] Erro ao carregar/reproduzir áudio:", {
          url: audioUrl,
          error: loadError,
          message: errorMessage,
        });
      }
    } catch (err) {
      setIsLoading(false);
      setError("Erro ao reproduzir áudio");
      console.error("[AudioButton] Erro geral:", err);
    }
  };

  return (
    <View>
      <Pressable
        onPress={handlePlayAudio}
        disabled={isDisabled}
        className={`
          w-14 h-14 rounded-full items-center justify-center
          ${
            isDisabled
              ? "bg-slate-200 opacity-50"
              : isActive
                ? "bg-indigo-600"
                : "bg-indigo-500 active:bg-indigo-600"
          }
        `}
        accessibilityRole="button"
        accessibilityLabel={isPlaying ? "Parar áudio" : "Reproduzir pronúncia"}
        accessibilityHint={
          audioUrl ? "Toque para ouvir a pronúncia" : "Áudio não disponível"
        }
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : isActive ? (
          <Text className="text-2xl text-white">⏸</Text>
        ) : (
          <Text className="text-2xl text-white">🔊</Text>
        )}
      </Pressable>

      {error && (
        <Text
          className="text-xs text-red-500 mt-2 text-center max-w-48"
          accessibilityLiveRegion="polite"
        >
          {error}
        </Text>
      )}
    </View>
  );
};

export default AudioButton;
