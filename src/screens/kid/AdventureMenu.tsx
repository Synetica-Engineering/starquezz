// The Adventure Menu — browsing is motivation. Affordable picks glow,
// locked ones show "X more ✦" (never hidden), and the free fallback is
// always present and warm. Picking happens at the Sunday ceremony.
import { useState } from 'react'
import { useFamily } from '../../state/family'
import { SqzIcon, StarToken } from '../../components/icons'
import { Toast, useToast } from '../../components/ui'
import type { Adventure, Child } from '../../lib/types'

const TIER_NAMES: Record<number, string> = {
  1: 'Anytime picks',
  2: 'Special picks',
  3: 'Premium picks',
}

export function AdventureMenu({ child }: { child: Child }) {
  const fam = useFamily()
  const [toast, showToast] = useToast()
  const [tapped, setTapped] = useState<string | null>(null)

  const menu = fam.adventures.filter((a) => !a.archived_at)
  const tiers = [1, 2, 3].map((t) => ({ tier: t, items: menu.filter((a) => a.tier === t) }))
  const fallbacks = menu.filter((a) => a.tier === 0)

  const tap = (a: Adventure) => {
    setTapped(a.id)
    setTimeout(() => setTapped(null), 600)
    const affordable = child.star_balance >= a.cost
    showToast(
      affordable ? 'Save it for the Sunday ceremony ✦' : `${a.cost - child.star_balance} more ✦ to go — keep going!`,
    )
  }

  const card = (a: Adventure) => {
    const unlocked = child.star_balance >= a.cost
    const isFallback = a.tier === 0
    const cls = 'adv ' + (isFallback ? 'fallback' : unlocked ? 'unlocked' : 'locked')
    return (
      <button
        className={cls}
        key={a.id}
        onClick={() => tap(a)}
        style={{
          border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0, width: '100%',
          transform: tapped === a.id ? 'scale(0.98)' : undefined,
        }}
      >
        <div className="art">
          <SqzIcon name={a.illustration} size={44} stroke={1.7} />
        </div>
        <div className="meta">
          <div className="col">
            <div className="an">{a.name}</div>
            <div className="as">
              {isFallback ? (
                '0 ✦ · any week, together'
              ) : unlocked ? (
                'unlocked ✓'
              ) : (
                <span style={{ color: '#FF9CC6' }}>{a.cost - child.star_balance} more ✦ to unlock</span>
              )}
            </div>
          </div>
          <span className="ap">
            {isFallback ? (
              '★ free'
            ) : (
              <>
                <StarToken size={13} /> {a.cost}
              </>
            )}
          </span>
        </div>
      </button>
    )
  }

  return (
    <div className="view scroll">
      <div className="row between" style={{ padding: '2px 0 10px' }}>
        <span className="dname" style={{ fontSize: 21 }}>
          Adventures
        </span>
        <span className="pill">
          <StarToken size={15} glow /> {child.star_balance}
        </span>
      </div>

      <div className="col gap12">
        {tiers.map(
          ({ tier, items }) =>
            items.length > 0 && (
              <div className="col gap12" key={tier}>
                <div className="tier-label">{TIER_NAMES[tier]}</div>
                {items.map(card)}
              </div>
            ),
        )}
        {fallbacks.length > 0 && (
          <div className="col gap12">
            <div className="tier-label">Always yours</div>
            {fallbacks.map(card)}
          </div>
        )}
        {menu.length === 0 && (
          <div className="pcard tac muted" style={{ padding: 24, fontSize: 14 }}>
            The menu is being cooked up — ask a grown-up ✦
          </div>
        )}
      </div>
      <Toast message={toast} />
    </div>
  )
}
