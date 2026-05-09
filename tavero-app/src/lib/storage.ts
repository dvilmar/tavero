import * as ImagePicker from 'expo-image-picker'
import { supabase } from '@/lib/supabase'

const BUCKET = 'tavero-assets'

type UploadTarget = 'products' | 'logos' | 'banners' | 'categories'

export async function pickImage(target: UploadTarget): Promise<string | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
  if (!permission.granted) return null

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: target === 'logos' ? [1, 1] : target === 'banners' ? [16, 9] : target === 'categories' ? [16, 6] : [4, 3],
    quality: 0.7,
  })

  if (result.canceled || !result.assets[0]) return null
  return result.assets[0].uri
}

export async function uploadImage(
  uri: string,
  target: UploadTarget,
  ownerId: string,
  itemId: string,
): Promise<string | null> {
  try {
    const ext = uri.split('.').pop()?.split('?')[0] ?? 'jpg'
    const fileName = `${itemId}-${Date.now()}.${ext}`
    const path = `${ownerId}/${target}/${fileName}`

    const arraybuffer = await fetch(uri).then((r) => r.arrayBuffer())

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, arraybuffer, { upsert: true, contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}` })

    if (error) {
      console.error('Storage upload error:', error.message)
      return null
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
    return data.publicUrl
  } catch (err) {
    console.error('Unexpected storage upload error:', err)
    return null
  }
}

export async function pickAndUpload(
  target: UploadTarget,
  ownerId: string,
  itemId: string,
): Promise<string | null> {
  const uri = await pickImage(target)
  if (!uri) return null
  return uploadImage(uri, target, ownerId, itemId)
}
