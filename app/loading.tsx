export default function Loading() {
  return (
    <>
      <style>{`
        @keyframes radarSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes centerPulse{0%,100%{box-shadow:0 0 0 0 color-mix(in srgb, var(--acc) 50%, transparent),0 0 20px color-mix(in srgb, var(--acc) 40%, transparent);transform:scale(1)}50%{box-shadow:0 0 0 15px color-mix(in srgb, var(--acc) 0%, transparent),0 0 30px color-mix(in srgb, var(--acc) 70%, transparent);transform:scale(1.08)}}
        @keyframes fadeText{0%,100%{opacity:.4}50%{opacity:1}}
        .loading-text{animation:fadeText 1.8s ease-in-out infinite;}
      `}</style>
      <div style={{background:'var(--bg)',color:'var(--ink)',minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:24,fontFamily:'var(--font-ui)'}}>
        <div style={{position:'relative',width:120,height:120}}>
          <div style={{position:'absolute',inset:0,borderRadius:'50%',border:'1px solid color-mix(in srgb, var(--acc) 25%, transparent)'}}/>
          <div style={{position:'absolute',inset:'15%',borderRadius:'50%',border:'1px solid color-mix(in srgb, var(--acc) 18%, transparent)'}}/>
          <div style={{position:'absolute',inset:0,borderRadius:'50%',background:'conic-gradient(from 0deg, color-mix(in srgb, var(--acc) 55%, transparent) 0deg, color-mix(in srgb, var(--acc) 15%, transparent) 30deg, transparent 60deg, transparent 360deg)',animation:'radarSpin 1.6s linear infinite'}}/>
          <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <div style={{width:42,height:42,borderRadius:'50%',background:'radial-gradient(circle at 35% 35%,color-mix(in srgb, var(--acc) 50%, transparent),color-mix(in srgb, var(--acc) 8%, transparent))',border:'1px solid color-mix(in srgb, var(--acc) 55%, transparent)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,animation:'centerPulse 2s ease-in-out infinite'}}>⚓</div>
          </div>
        </div>
        <div className="loading-text" style={{fontFamily:'var(--font-ui)',fontSize:11,letterSpacing:'4px',textTransform:'uppercase',color:'var(--acc)',fontWeight:700}}>
          Loading
        </div>
      </div>
    </>
  );
}
