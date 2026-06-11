// Pick-a-face: 16 animal friends, or the kid's own photo from the gallery.
// Photos are downscaled client-side to a tiny square JPEG and stored inside
// the family's RLS-protected row — they never touch a public bucket.
import { useRef } from 'react'
import { ANIMAL_KEYS, ANIMALS, AnimalFace } from './animals'
import { SqzIcon } from './icons'

/** center-crop + downscale a gallery image to a 192px JPEG data URL */
export function fileToAvatar(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      try {
        const s = 192
        const canvas = document.createElement('canvas')
        canvas.width = s
        canvas.height = s
        const ctx = canvas.getContext('2d')!
        const m = Math.min(img.width, img.height)
        ctx.drawImage(img, (img.width - m) / 2, (img.height - m) / 2, m, m, 0, 0, s, s)
        resolve(canvas.toDataURL('image/jpeg', 0.82))
      } catch (e) {
        reject(e instanceof Error ? e : new Error('image_failed'))
      } finally {
        URL.revokeObjectURL(url)
      }
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('image_failed'))
    }
    img.src = url
  })
}

export function AvatarPicker({
  avatar,
  photo,
  onAvatar,
  onPhoto,
}: {
  avatar: string
  photo: string | null
  onAvatar: (key: string) => void
  onPhoto: (dataUrl: string | null) => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)

  const pickFile = async (file: File | undefined) => {
    if (!file) return
    try {
      onPhoto(await fileToAvatar(file))
    } catch {
      /* unreadable image — keep the current face, no drama */
    }
  }

  return (
    <div className="col gap10">
      <div className="avatar-grid">
        {/* the kid's own photo slot */}
        <button
          type="button"
          className={'avatar-pick photo-slot' + (photo ? ' on' : '')}
          onClick={() => fileRef.current?.click()}
          aria-label={photo ? 'change photo' : 'use a photo from your gallery'}
          title="Use a photo"
        >
          {photo ? (
            <img src={photo} alt="" style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', display: 'block' }} />
          ) : (
            <span className="photo-empty">
              <SqzIcon name="plus" size={18} />
            </span>
          )}
        </button>
        {ANIMAL_KEYS.map((key) => (
          <button
            type="button"
            key={key}
            className={'avatar-pick' + (!photo && avatar === key ? ' on' : '')}
            onClick={() => {
              onPhoto(null) // choosing an animal switches off the photo
              onAvatar(key)
            }}
            aria-label={`avatar ${ANIMALS[key].label}`}
            title={ANIMALS[key].label}
          >
            <AnimalFace name={key} size={56} />
          </button>
        ))}
      </div>
      <div className="row between" style={{ minHeight: 22 }}>
        <button type="button" className="chip skip" onClick={() => fileRef.current?.click()}>
          <SqzIcon name="paint" size={12} style={{ marginRight: 5, verticalAlign: -2 }} />
          {photo ? 'change the photo' : 'or use a photo from your gallery'}
        </button>
        {photo && (
          <button type="button" className="chip skip" onClick={() => onPhoto(null)}>
            remove photo
          </button>
        )}
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => {
          void pickFile(e.target.files?.[0])
          e.target.value = ''
        }}
      />
    </div>
  )
}
