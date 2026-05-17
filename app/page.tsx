export default function Home() {
  return (
    <main style={{
      minHeight: '100vh',
      backgroundColor: '#0a1628',
      color: '#f0e6c8',
      fontFamily: 'Georgia, serif',
    }}>
      {/* NAVBAR */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 40px',
        borderBottom: '1px solid #c9a84c33',
      }}>
        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#c9a84c', letterSpacing: '2px' }}>
          PortServiceFinder
        </div>
        <div style={{ display: 'flex', gap: '30px', fontSize: '14px' }}>
          <a href="#" style={{ color: '#f0e6c8', textDecoration: 'none' }}>Search</a>
          <a href="#" style={{ color: '#f0e6c8', textDecoration: 'none' }}>For Providers</a>
          <a href="#" style={{ color: '#f0e6c8', textDecoration: 'none' }}>Pricing</a>
          <a href="#" style={{
            backgroundColor: '#c9a84c',
            color: '#0a1628',
            padding: '8px 20px',
            borderRadius: '4px',
            textDecoration: 'none',
            fontWeight: 'bold',
          }}>List Your Business</a>
        </div>
      </nav>

      {/* HERO */}
      <section style={{
        textAlign: 'center',
        padding: '100px 40px 80px',
        maxWidth: '800px',
        margin: '0 auto',
      }}>
        <p style={{ color: '#c9a84c', letterSpacing: '4px', fontSize: '12px', marginBottom: '20px' }}>
          GLOBAL MARITIME DIRECTORY
        </p>
        <h1 style={{
          fontSize: '52px',
          fontWeight: 'bold',
          lineHeight: '1.2',
          marginBottom: '24px',
        }}>
          Find Ship Agents & Port Services at Every Port Worldwide
        </h1>
        <p style={{ fontSize: '18px', color: '#b0a080', marginBottom: '50px', lineHeight: '1.6' }}>
          Free for vessel operators. Search ship agents, shipchandlers and marine services at 1,000+ ports globally.
        </p>

        {/* SEARCH BOX */}
        <div style={{
          display: 'flex',
          gap: '0',
          maxWidth: '600px',
          margin: '0 auto',
          boxShadow: '0 0 40px #c9a84c22',
        }}>
          <input
            type="text"
            placeholder="Search by port name (e.g. Mersin, Singapore, Rotterdam...)"
            style={{
              flex: 1,
              padding: '18px 24px',
              fontSize: '16px',
              border: '2px solid #c9a84c',
              borderRight: 'none',
              borderRadius: '4px 0 0 4px',
              backgroundColor: '#0f1f3d',
              color: '#f0e6c8',
              outline: 'none',
            }}
          />
          <button style={{
            padding: '18px 32px',
            backgroundColor: '#c9a84c',
            color: '#0a1628',
            border: 'none',
            borderRadius: '0 4px 4px 0',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}>
            Search
          </button>
        </div>
      </section>

      {/* STATS */}
      <section style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '80px',
        padding: '60px 40px',
        borderTop: '1px solid #c9a84c22',
        borderBottom: '1px solid #c9a84c22',
      }}>
        {[
          { number: '1,000+', label: 'Ports in Database' },
          { number: '160+', label: 'Countries Covered' },
          { number: '22', label: 'Service Categories' },
          { number: '$0', label: 'Search Fee' },
        ].map((stat) => (
          <div key={stat.label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '42px', fontWeight: 'bold', color: '#c9a84c' }}>{stat.number}</div>
            <div style={{ fontSize: '14px', color: '#8a7a60', marginTop: '8px', letterSpacing: '1px' }}>{stat.label}</div>
          </div>
        ))}
      </section>

      {/* SERVICES */}
      <section style={{ padding: '80px 40px', maxWidth: '1100px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '32px', marginBottom: '50px', color: '#c9a84c' }}>
          What Can You Find?
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
          {[
            { title: 'Ship Agents', desc: 'Port agents, husbandry agents, liner agents across all major ports worldwide.' },
            { title: 'Shipchandlers', desc: 'Ship supplies, provisions, deck and engine stores delivered to your vessel.' },
            { title: 'Marine Services', desc: 'Crew changes, bunkering, repairs, surveys, waste disposal and more.' },
          ].map((service) => (
            <div key={service.title} style={{
              padding: '36px',
              border: '1px solid #c9a84c44',
              borderRadius: '8px',
              backgroundColor: '#0f1f3d',
              transition: 'border-color 0.2s',
            }}>
              <h3 style={{ fontSize: '20px', color: '#c9a84c', marginBottom: '16px' }}>{service.title}</h3>
              <p style={{ fontSize: '15px', color: '#8a7a60', lineHeight: '1.7' }}>{service.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section style={{
        padding: '80px 40px',
        backgroundColor: '#0f1f3d',
        textAlign: 'center',
      }}>
        <h2 style={{ fontSize: '32px', marginBottom: '16px', color: '#c9a84c' }}>Simple Pricing for Providers</h2>
        <p style={{ color: '#8a7a60', marginBottom: '50px' }}>Free to search for vessel operators. No commissions.</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', flexWrap: 'wrap' }}>
          {[
            { plan: 'Monthly', price: '$149', period: '/month', badge: null },
            { plan: 'Annual', price: '$1,200', period: '/year', badge: 'Save $588' },
          ].map((p) => (
            <div key={p.plan} style={{
              padding: '40px',
              border: '2px solid #c9a84c',
              borderRadius: '8px',
              minWidth: '260px',
              position: 'relative',
            }}>
              {p.badge && (
                <div style={{
                  position: 'absolute',
                  top: '-14px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: '#c9a84c',
                  color: '#0a1628',
                  padding: '4px 16px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                }}>{p.badge}</div>
              )}
              <div style={{ fontSize: '16px', marginBottom: '16px', letterSpacing: '2px' }}>{p.plan.toUpperCase()}</div>
              <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#c9a84c' }}>{p.price}</div>
              <div style={{ color: '#8a7a60', marginBottom: '24px' }}>{p.period}</div>
              <button style={{
                width: '100%',
                padding: '14px',
                backgroundColor: '#c9a84c',
                color: '#0a1628',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}>Get Listed</button>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        textAlign: 'center',
        padding: '40px',
        borderTop: '1px solid #c9a84c22',
        color: '#4a3a20',
        fontSize: '14px',
      }}>
        © 2026 PortServiceFinder — Global directory for ship agents, chandlers and marine services.
        <br />
        <span style={{ color: '#c9a84c33' }}>info@portservicefinder.com</span>
      </footer>
    </main>
  );
}