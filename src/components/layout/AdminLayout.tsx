import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, FileText, BarChart3,
  ChevronLeft, ChevronRight, LogOut, Menu, X,
  Bell, ShieldCheck,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../hooks/use-toast'

const NAV = [
  { to: '/admin/dashboard',    icon: LayoutDashboard, label: 'Dashboard'    },
  { to: '/admin/members',      icon: Users,           label: 'Members'      },
  { to: '/admin/transactions', icon: FileText,        label: 'Transactions' },
  { to: '/admin/reports',      icon: BarChart3,       label: 'Reports'      },
]

const getInitials = (name: string) =>
  name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : 'AD'

interface Props { children: React.ReactNode }

export const AdminLayout = ({ children }: Props) => {
  const [collapsed,  setCollapsed]  = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { toast }        = useToast()

  useEffect(() => {
    const check = () => { if (window.innerWidth < 1024) setCollapsed(true) }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  const handleLogout = async () => {
    await logout()
    toast({ title: '👋 Logged out' })
    navigate('/admin/login')
  }

  const currentPage = NAV.find(n => n.to === location.pathname)?.label ?? 'Admin'

  const SidebarInner = ({ mobile = false }: { mobile?: boolean }) => {
    const slim = collapsed && !mobile
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', height: '100%',
        background: 'linear-gradient(175deg,#0f2035 0%,#091628 55%,#060f1a 100%)',
      }}>
        {/* Logo + toggle */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: slim ? 'center' : 'space-between',
          padding: slim ? '18px 0' : '18px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          minHeight: 64, gap: 8,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
            <div style={{
              width: 34, height: 34, borderRadius: 9, flexShrink: 0,
              background: 'linear-gradient(135deg,#C9A84C,#a8872e)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17,
            }}>✝</div>
            {!slim && (
              <div style={{ overflow: 'hidden' }}>
                <span style={{
                  fontFamily: '"Playfair Display",serif', fontSize: 18,
                  fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', display: 'block',
                }}>BlessPay</span>
                <span style={{
                  fontFamily: '"DM Sans",sans-serif', fontSize: 10, fontWeight: 700,
                  letterSpacing: '1.2px', textTransform: 'uppercase',
                  color: '#C9A84C', whiteSpace: 'nowrap',
                }}>Admin Panel</span>
              </div>
            )}
          </div>
          {!mobile && (
            <button
              onClick={() => setCollapsed(c => !c)}
              title={collapsed ? 'Expand' : 'Collapse'}
              style={{
                background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: 7,
                padding: '5px 6px', cursor: 'pointer', color: 'rgba(255,255,255,0.6)',
                display: 'flex', alignItems: 'center', flexShrink: 0, transition: 'all 150ms',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,168,76,0.25)'; e.currentTarget.style.color = '#C9A84C' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}
            >
              {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
            </button>
          )}
        </div>

        {/* Admin profile */}
        <div style={{
          padding: slim ? '18px 0' : '18px 20px',
          display: 'flex', flexDirection: slim ? 'column' : 'row',
          alignItems: 'center', gap: slim ? 8 : 12,
          borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}>
          <div style={{
            width: slim ? 40 : 50, height: slim ? 40 : 50,
            borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg,#C9A84C,#8a6820)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2.5px solid rgba(201,168,76,0.45)',
            boxShadow: '0 0 0 4px rgba(201,168,76,0.1)', transition: 'all 250ms',
          }}>
            <span style={{
              fontFamily: '"Playfair Display",serif',
              fontSize: slim ? 14 : 17, fontWeight: 700, color: '#1a2f1a',
            }}>{getInitials(user?.username ?? user?.email ?? '')}</span>
          </div>
          {!slim && (
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <p style={{
                fontFamily: '"DM Sans",sans-serif', fontSize: 13, fontWeight: 600,
                color: '#fff', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>{user?.username ?? user?.email ?? 'Admin'}</p>
              <p style={{
                fontFamily: '"DM Sans",sans-serif', fontSize: 11,
                color: 'rgba(255,255,255,0.4)', margin: '2px 0 6px',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>{user?.email ?? ''}</p>
              <span style={{
                background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.35)',
                borderRadius: 20, padding: '2px 9px', fontSize: 10,
                fontFamily: '"DM Sans",sans-serif', color: '#C9A84C',
                fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px',
                display: 'inline-flex', alignItems: 'center', gap: 4,
              }}>
                <ShieldCheck size={9} /> Admin
              </span>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto', overflowX: 'hidden' }}>
          {!slim && (
            <p style={{
              fontFamily: '"DM Sans",sans-serif', fontSize: 10, fontWeight: 700,
              letterSpacing: '1.2px', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.22)', padding: '4px 20px 8px', margin: 0,
            }}>Management</p>
          )}
          {NAV.map(({ to, icon: Icon, label }) => {
            const active = location.pathname === to
            return (
              <Link key={to} to={to} style={{ textDecoration: 'none', display: 'block' }}>
                <div
                  title={slim ? label : undefined}
                  style={{
                    display: 'flex', alignItems: 'center', gap: slim ? 0 : 12,
                    padding: slim ? '12px 0' : '10px 20px',
                    justifyContent: slim ? 'center' : 'flex-start',
                    margin: '2px 8px', borderRadius: 10,
                    background: active ? 'linear-gradient(90deg,rgba(201,168,76,0.18),rgba(201,168,76,0.04))' : 'transparent',
                    borderLeft: active ? '3px solid #C9A84C' : '3px solid transparent',
                    transition: 'all 150ms', cursor: 'pointer', position: 'relative',
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
                >
                  <Icon size={18} color={active ? '#C9A84C' : 'rgba(255,255,255,0.5)'} strokeWidth={active ? 2.5 : 1.8} style={{ flexShrink: 0 }} />
                  {!slim && (
                    <span style={{
                      fontFamily: '"DM Sans",sans-serif', fontSize: 13,
                      fontWeight: active ? 600 : 400,
                      color: active ? '#C9A84C' : 'rgba(255,255,255,0.65)',
                      whiteSpace: 'nowrap',
                    }}>{label}</span>
                  )}
                  {active && slim && (
                    <div style={{
                      position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
                      width: 3, height: 20, background: '#C9A84C', borderRadius: '3px 0 0 3px',
                    }} />
                  )}
                </div>
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <button
            onClick={handleLogout}
            title={slim ? 'Logout' : undefined}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: slim ? 0 : 12,
              padding: slim ? '10px 0' : '10px 12px', justifyContent: slim ? 'center' : 'flex-start',
              background: 'none', border: 'none', cursor: 'pointer',
              borderRadius: 10, transition: 'background 150ms',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            <LogOut size={17} color="rgba(255,255,255,0.4)" style={{ flexShrink: 0 }} />
            {!slim && (
              <span style={{
                fontFamily: '"DM Sans",sans-serif', fontSize: 13,
                color: 'rgba(255,255,255,0.45)', whiteSpace: 'nowrap',
              }}>Logout</span>
            )}
          </button>
        </div>
      </div>
    )
  }

  const sidebarW = collapsed ? 72 : 240

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&display=swap');
        *{box-sizing:border-box}
        body{margin:0;background:#F0F2F5}
        .bpa-layout{display:flex;min-height:100vh;background:#F0F2F5}
        .bpa-sidebar{
          position:fixed;top:0;left:0;bottom:0;
          width:${sidebarW}px;z-index:40;
          transition:width 260ms cubic-bezier(.4,0,.2,1);
          box-shadow:4px 0 24px rgba(0,0,0,0.22);
        }
        .bpa-spacer{
          width:${sidebarW}px;flex-shrink:0;
          transition:width 260ms cubic-bezier(.4,0,.2,1);
        }
        .bpa-overlay{
          display:none;position:fixed;inset:0;
          background:rgba(0,0,0,0.55);z-index:49;
          backdrop-filter:blur(3px);
        }
        .bpa-drawer{
          position:fixed;top:0;left:0;bottom:0;width:260px;
          z-index:50;transform:translateX(-100%);
          transition:transform 270ms cubic-bezier(.4,0,.2,1);
          box-shadow:8px 0 40px rgba(0,0,0,0.4);
        }
        .bpa-topbar{
          height:64px;background:#fff;
          border-bottom:1px solid #E9EAEC;
          display:flex;align-items:center;
          padding:0 24px;gap:12px;
          box-shadow:0 1px 12px rgba(0,0,0,0.05);
          position:sticky;top:0;z-index:30;
        }
        .bpa-hamburger{display:none!important}
        .bpa-main{flex:1;display:flex;flex-direction:column;min-width:0}
        .bpa-content{flex:1;padding:28px 24px;width:100%;max-width:1400px;margin:0 auto}
        .bpa-uname{display:block}

        @media(max-width:1023px){
          .bpa-sidebar{display:none!important}
          .bpa-spacer{display:none!important}
          .bpa-hamburger{display:flex!important}
          .bpa-drawer.open{transform:translateX(0)!important}
          .bpa-overlay.open{display:block!important}
        }
        @media(max-width:600px){
          .bpa-content{padding:16px 12px}
          .bpa-topbar{padding:0 12px}
          .bpa-uname{display:none!important}
        }

        /* Global card upgrades applied across all pages under this layout */
        .bpa-content .bg-card,
        .bpa-content [class*="rounded-lg"]{
          border-radius:16px!important;
          box-shadow:0 2px 16px rgba(0,0,0,0.06)!important;
        }
        .bpa-content table thead tr{
          background:#F8F9FB!important;
        }
        .bpa-content table tbody tr:hover{
          background:#F8F9FB!important;
          transition:background 120ms;
        }
      `}</style>

      <div className="bpa-layout">
        {/* Desktop sidebar */}
        <div className="bpa-sidebar" style={{ width: sidebarW }}>
          <SidebarInner />
        </div>
        <div className="bpa-spacer" style={{ width: sidebarW }} />

        {/* Mobile */}
        <div className={`bpa-overlay${mobileOpen ? ' open' : ''}`} onClick={() => setMobileOpen(false)} />
        <div className={`bpa-drawer${mobileOpen ? ' open' : ''}`}>
          <SidebarInner mobile />
        </div>

        {/* Main */}
        <div className="bpa-main">
          <header className="bpa-topbar">
            <button
              className="bpa-hamburger"
              onClick={() => setMobileOpen(o => !o)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#1E3A5F', padding: 6, borderRadius: 8,
                alignItems: 'center', justifyContent: 'center', transition: 'background 150ms',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#F3F4F6'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                fontFamily: '"DM Sans",sans-serif', fontSize: 10, fontWeight: 700,
                letterSpacing: '1px', textTransform: 'uppercase', color: '#C9A84C', margin: '0 0 1px',
              }}>Admin Panel</p>
              <h2 style={{
                fontFamily: '"Playfair Display",serif', fontSize: 17,
                fontWeight: 700, color: '#1E3A5F', margin: 0,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>{currentPage}</h2>
            </div>

            {/* Bell */}
            <button style={{
              background: '#F8F9FA', border: '1px solid #E9EAEC', borderRadius: 10,
              width: 38, height: 38, cursor: 'pointer', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#6B7280', transition: 'all 150ms',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = '#1E3A5F'; (e.currentTarget as HTMLButtonElement).style.color = '#fff' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#F8F9FA'; (e.currentTarget as HTMLButtonElement).style.color = '#6B7280' }}
            >
              <Bell size={16} />
            </button>

            {/* Admin chip */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 9,
              background: '#F8F9FA', border: '1px solid #E9EAEC',
              borderRadius: 40, padding: '4px 14px 4px 4px', cursor: 'default',
              flexShrink: 0, transition: 'border-color 150ms',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#C9A84C'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#E9EAEC'}
            >
              <div style={{
                width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg,#C9A84C,#a8872e)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontFamily: '"Playfair Display",serif', fontSize: 11, fontWeight: 700, color: '#1a2f1a' }}>
                  {getInitials(user?.username ?? user?.email ?? '')}
                </span>
              </div>
              <div>
                <span className="bpa-uname" style={{
                  fontFamily: '"DM Sans",sans-serif', fontSize: 12, fontWeight: 600,
                  color: '#374151', display: 'block', lineHeight: 1.2,
                }}>{user?.username ?? 'Admin'}</span>
                <span style={{
                  fontFamily: '"DM Sans",sans-serif', fontSize: 10,
                  color: '#C9A84C', fontWeight: 700, letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                }}>Administrator</span>
              </div>
            </div>
          </header>

          <main className="bpa-content">{children}</main>
        </div>
      </div>
    </>
  )
}