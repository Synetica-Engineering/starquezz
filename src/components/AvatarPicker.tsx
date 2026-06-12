// Pick-a-face: animal friends, or the kid's own photo from the gallery.
// Photos are downscaled client-side to a tiny square JPEG and stored inside
// the family's RLS-protected row — they never touch a public bucket.
import { useRef, useState } from 'react'
import { ANIMAL_KEYS, ANIMALS, AnimalFace } from './animals'
import { SqzIcon } from './icons'

export class AvatarError extends Error {
  constructor(public reason: 'heic' | 'too_big' | 'decode') {
    super(reason)
  }
}

function isHeic(file: File): boolean {
  return /heic|heif/i.test(file.type) || /\.(heic|heif)$/i.test(file.name)
}

function squareTo192(bitmap: ImageBitmap | HTMLImageElement, w: number, h: number): string {
  const s = 192
  const canvas = document.createElement('canvas')
  canvas.width = s
  canvas.height = s
  const ctx = canvas.getContext('2d')!
  const m = Math.min(w, h)
  // center-crop to a square, then downscale
  ctx.drawImage(bitmap as CanvasImageSource, (w - m) / 2, (h - m) / 2, m, m, 0, 0, s, s)
  return canvas.toDataURL('image/jpeg', 0.82)
}

/** center-crop + downscale a gallery image to a 192px JPEG data URL.
 * Tries createImageBitmap (fast, EXIF-aware, broad format support) and
 * falls back to <img>; surfaces a typed error so the UI can explain. */
export async function fileToAvatar(file: File): Promise<string> {
  if (file.size > 25 * 1024 * 1024) throw new AvatarError('too_big')

  // createImageBitmap handles orientation and most formats in one step
  if ('createImageBitmap' in window) {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' } as ImageBitmapOptions)
      const out = squareTo192(bitmap, bitmap.width, bitmap.height)
      bitmap.close()
      return out
    } catch {
      // fall through to the <img> path
    }
  }

  // fallback: object URL + <img>
  const out = await new Promise<string | null>((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      try {
        resolve(squareTo192(img, img.naturalWidth, img.naturalHeight))
      } catch {
        resolve(null)
      } finally {
        URL.revokeObjectURL(url)
      }
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(null)
    }
    img.src = url
  })
  if (out) return out

  // both paths failed — HEIC in a non-Safari browser is the usual culprit
  throw new AvatarError(isHeic(file) ? 'heic' : 'decode')
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
  const [working, setWorking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const pickFile = async (file: File | undefined) => {
    if (!file) return
    setError(null)
    setWorking(true)
    try {
      onPhoto(await fileToAvatar(file))
    } catch (e) {
      if (e instanceof AvatarError && e.reason === 'heic') {
        setError(
          'That looks like an iPhone HEIC photo, which some browsers can’t open. On your iPhone set Camera → Formats → “Most Compatible”, or pick a JPG/PNG.',
        )
      } else if (e instanceof AvatarError && e.reason === 'too_big') {
        setError('That image is very large — try one under 25 MB.')
      } else {
        setError('Couldn’t read that image — try a different one (JPG or PNG).')
      }
    } finally {
      setWorking(false)
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
              <SqzIcon name={working ? 'sparkle' : 'plus'} size={18} />
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
      {working && <div className="muted" style={{ fontSize: 12.5 }}>shrinking your photo…</div>}
      {error && <div className="form-error" style={{ fontSize: 12.5 }}>{error}</div>}
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
