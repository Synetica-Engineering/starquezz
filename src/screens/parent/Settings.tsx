// Settings — quiet corners: per-kid secret codes (only visible with 2+
// children — with one kid there's no sibling to protect against), star
// corrections, sounds, the Sunday reminder, account.
import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useFamily } from '../../state/family'
import { KidAvatar, SqzIcon } from '../../components/icons'
import { Keypad, Sheet, Toast, useToast } from '../../components/ui'
import { AvatarPicker } from '../../components/AvatarPicker'
import { isMuted, setMuted } from '../../lib/sound'
import type { Child } from '../../lib/types'

export function Settings({ onAddChild }: { onAddChild: () => void }) {
  const fam = useFamily()
  const [muted, setMutedState] = useState(isMuted())
  const [codeFor, setCodeFor] = useState<Child | null>(null)
  const [code, setCode] = useState('')
  const [adjustFor, setAdjustFor] = useState<Child | null>(null)
  const [faceFor, setFaceFor] = useState<Child | null>(null)
  const [faceAvatar, setFaceAvatar] = useState('cat')
  const [facePhoto, setFacePhoto] = useState<string | null>(null)
  const [delta, setDelta] = useState(0)
  const [note, setNote] = useState('')
  const [pinSheet, setPinSheet] = useState(false)
  const [newPin, setNewPin] = useState('')
  const [toast, showToast] = useToast()

  const toggleReminder = async () => {
    if (!fam.parent) return
    await supabase.from('parents').update({ ceremony_reminder: !fam.parent.ceremony_reminder }).eq('id', fam.parent.id)
    await fam.refresh()
  }

  const saveCode = async (v: string) => {
    setCode(v)
    if (v.length === 4 && codeFor) {
      await fam.setChildCode(codeFor.id, v)
      setCodeFor(null)
      setCode('')
      showToast(`${codeFor.name}’s secret code is set`)
    }
  }

  const clearCode = async (child: Child) => {
    await fam.setChildCode(child.id, null)
    showToast(`${child.name}’s code removed`)
  }

  const openFace = (child: Child) => {
    setFaceAvatar(child.avatar)
    setFacePhoto(child.photo)
    setFaceFor(child)
  }

  const saveFace = async () => {
    if (!faceFor) return
    const { error } = await supabase
      .from('children')
      .update({ avatar: faceAvatar, photo: facePhoto })
      .eq('id', faceFor.id)
    if (error) return showToast('Could not save the face')
    setFaceFor(null)
    await fam.refresh()
    showToast(`${faceFor.name}’s face updated`)
  }

  const saveAdjust = async () => {
    if (!adjustFor || delta === 0) return
    await fam.adjustStars(adjustFor.id, delta, note || 'parent correction')
    setAdjustFor(null)
    setDelta(0)
    setNote('')
    showToast('Stars adjusted — it’ll show in the digest')
  }

  const savePin = async (v: string) => {
    setNewPin(v)
    if (v.length === 4) {
      await fam.setParentPin(v)
      setPinSheet(false)
      setNewPin('')
      showToast('Parent PIN updated')
    }
  }

  return (
    <div className="view scroll">
      <div className="parent-head">
        <span className="pt grow">More</span>
      </div>

      <div className="col gap14">
        <div className="col gap8">
          <div className="eyebrow">Kids</div>
          {fam.children.map((c) => (
            <div className="plist-row" key={c.id}>
              <button
                className="avatar-btn"
                onClick={() => openFace(c)}
                aria-label={`change ${c.name}’s face or photo`}
                title="Change face or photo"
              >
                <KidAvatar avatar={c.avatar} photo={c.photo} size={38} />
              </button>
              <span className="col grow">
                <span className="pr-name">{c.name}</span>
                <span className="pr-sub">
                  {c.star_balance} ✦{c.birth_year ? ` · born ${c.birth_year}` : ''}
                </span>
              </span>
              <button className="chip edit" onClick={() => setAdjustFor(c)}>
                ± stars
              </button>
              {/* secret-code toggle only exists for 2+ kids — with one kid
                  there is no sibling to protect against */}
              {fam.children.length >= 2 &&
                (c.secret_code_hash ? (
                  <button className="chip skip" onClick={() => void clearCode(c)}>
                    code off
                  </button>
                ) : (
                  <button className="chip accept" onClick={() => setCodeFor(c)}>
                    secret code
                  </button>
                ))}
            </div>
          ))}
          <button className="btn ghost sm" onClick={onAddChild}>
            <SqzIcon name="plus" size={15} style={{ marginRight: 6, verticalAlign: -2 }} />
            Add another kid
          </button>
        </div>

        <div className="col gap8">
          <div className="eyebrow">Rituals & sounds</div>
          <div className="plist-row">
            <span className="pr-icon">
              <SqzIcon name="calendar" size={19} />
            </span>
            <span className="col grow">
              <span className="pr-name">Sunday ceremony reminder</span>
              <span className="pr-sub">one gentle nudge a week — the only notification we’ll ever want</span>
            </span>
            <button
              className={'toggle' + (fam.parent?.ceremony_reminder ? ' on' : '')}
              onClick={() => void toggleReminder()}
              aria-label="toggle ceremony reminder"
            />
          </div>
          <div className="plist-row">
            <span className="pr-icon">
              <SqzIcon name={muted ? 'volume-x' : 'volume'} size={19} />
            </span>
            <span className="col grow">
              <span className="pr-name">Sounds</span>
              <span className="pr-sub">short, soft, charming — never required</span>
            </span>
            <button
              className={'toggle' + (!muted ? ' on' : '')}
              onClick={() => {
                setMuted(!muted)
                setMutedState(!muted)
              }}
              aria-label="toggle sounds"
            />
          </div>
        </div>

        <div className="col gap8">
          <div className="eyebrow">Account</div>
          <div className="plist-row">
            <span className="pr-icon">
              <SqzIcon name="lock" size={18} />
            </span>
            <span className="col grow">
              <span className="pr-name">Parent PIN</span>
              <span className="pr-sub">{fam.parent?.email}</span>
            </span>
            <button className="chip edit" onClick={() => setPinSheet(true)}>
              change
            </button>
          </div>
          <button className="btn ghost sm" onClick={() => void supabase.auth.signOut()}>
            <SqzIcon name="logout" size={15} style={{ marginRight: 6, verticalAlign: -2 }} />
            Sign out
          </button>
        </div>

        <div className="muted tac" style={{ fontSize: 12, lineHeight: 1.6, paddingBottom: 8 }}>
          StarqueZZ is free for every family, forever.
          <br />
          Built with ❤️ for Zen & Zia by Synetica.
        </div>
      </div>

      {codeFor && (
        <Sheet
          onClose={() => {
            setCodeFor(null)
            setCode('')
          }}
        >
          <div className="col center gap14 tac">
            <h3 style={{ margin: 0 }}>{codeFor.name}’s secret code</h3>
            <p className="muted" style={{ margin: 0, fontSize: 13.5, lineHeight: 1.5, maxWidth: 260 }}>
              Frame it as <b>their</b> secret stars — an ownership ritual, not a lock. They’ll tap it on the
              avatar screen.
            </p>
            <Keypad value={code} onChange={(v) => void saveCode(v)} />
          </div>
        </Sheet>
      )}

      {faceFor && (
        <Sheet onClose={() => setFaceFor(null)}>
          <h3>{faceFor.name}’s face</h3>
          <p className="muted" style={{ fontSize: 13, margin: '-6px 0 12px', lineHeight: 1.5 }}>
            Pick an animal friend — or use a photo from your gallery. The photo stays inside your family’s
            account, nowhere else.
          </p>
          <AvatarPicker avatar={faceAvatar} photo={facePhoto} onAvatar={setFaceAvatar} onPhoto={setFacePhoto} />
          <button className="btn full" style={{ marginTop: 14 }} onClick={() => void saveFace()}>
            Save {faceFor.name}’s face
          </button>
        </Sheet>
      )}

      {adjustFor && (
        <Sheet onClose={() => setAdjustFor(null)}>
          <h3>Adjust {adjustFor.name}’s stars</h3>
          <div className="col gap12">
            <div className="row gap8 center">
              <button className="iconbtn" onClick={() => setDelta(delta - 1)} aria-label="minus">
                −
              </button>
              <span className="dname" style={{ fontSize: 28, minWidth: 70, justifyContent: 'center' }}>
                {delta > 0 ? `+${delta}` : delta}
              </span>
              <button className="iconbtn" onClick={() => setDelta(delta + 1)} aria-label="plus">
                +
              </button>
            </div>
            <input
              className="input"
              value={note}
              maxLength={80}
              onChange={(e) => setNote(e.target.value)}
              placeholder="why? (shows in your digest)"
            />
            <button className="btn full" disabled={delta === 0} onClick={() => void saveAdjust()}>
              Apply — leaves a footprint
            </button>
          </div>
        </Sheet>
      )}

      {pinSheet && (
        <Sheet
          onClose={() => {
            setPinSheet(false)
            setNewPin('')
          }}
        >
          <div className="col center gap14 tac">
            <h3 style={{ margin: 0 }}>New parent PIN</h3>
            <Keypad value={newPin} onChange={(v) => void savePin(v)} />
          </div>
        </Sheet>
      )}
      <Toast message={toast} />
    </div>
  )
}
