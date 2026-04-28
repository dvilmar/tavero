import { ActivityIndicator, Image, Pressable, Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Svg, Path, Circle } from 'react-native-svg'

type Props = {
  label: string
  imageUrl: string | null
  onPress: () => void
  uploading?: boolean
  aspectRatio?: number
  circular?: boolean
}

function CameraIcon({ size = 28 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <Circle cx={12} cy={13} r={4} />
    </Svg>
  )
}

export function ImagePickerField({ label, imageUrl, onPress, uploading, aspectRatio = 4 / 3, circular }: Props) {
  const { t } = useTranslation()
  const containerClass = circular
    ? 'w-28 h-28 rounded-full'
    : 'w-full rounded-xl'

  return (
    <View className={circular ? 'items-center gap-2' : 'gap-1'}>
      {label && <Text className="text-sm font-medium text-primary">{label}</Text>}
      <Pressable onPress={onPress} disabled={uploading}>
        {imageUrl ? (
          <View className={`${containerClass} overflow-hidden bg-borderSoft relative`}
            style={circular ? undefined : { aspectRatio }}>
            <Image
              source={{ uri: imageUrl }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
            {uploading && (
              <View className="absolute inset-0 bg-black/40 items-center justify-center">
                <ActivityIndicator color="#fff" />
              </View>
            )}
            {!uploading && (
              <View className="absolute bottom-1 right-1 bg-black/60 rounded-full px-2 py-0.5">
                <Text className="text-white text-[10px] font-medium">{t('common.change')}</Text>
              </View>
            )}
          </View>
        ) : (
          <View
            className={`${containerClass} bg-surface border-2 border-dashed border-border items-center justify-center`}
            style={circular ? undefined : { aspectRatio }}
          >
            {uploading
              ? <ActivityIndicator color="#9CA3AF" />
              : <CameraIcon size={circular ? 28 : 36} />
            }
          </View>
        )}
      </Pressable>
    </View>
  )
}
