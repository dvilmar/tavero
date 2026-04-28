import * as Haptics from 'expo-haptics'

export const haptic = {
  light:    () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}),
  success:  () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {}),
  select:   () => Haptics.selectionAsync().catch(() => {}),
}
