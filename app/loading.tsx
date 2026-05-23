export default function Loading() {
  return (
    <>
      <style>{`
        @keyframes radarSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes centerPulse{0%,100%{box-shadow:0 0 0 0 rgba(200,168,75,.5),0 0 20px rgba(200,168,75,.4);transform:scale(1)}50%{box-shadow:0 0 0 15px rgba(200,168,75,0),0 0 30px rgba(200,168,75,.7);transform:scale(1.08)}}
        @keyframes fadeText{0%,100%{opacity:.4}50%{opacity:1}}
        .loading-text{animation:fadeText 1.8s ease-in-out infinite;}
      `}</style>
      <div style={{background:'#08100a',color:'#f5f0e8',minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:24,fontFamily:"'Outfit',sans-serif"}}>
        <div style={{position:'relative',width:120,height:120}}>
          <div style={{position:'absolute',inset:0,borderRadius:'50%',border:'1px solid rgba(200,168,75,.25)'}}/>
          <div style={{position:'absolute',inset:'15%',borderRadius:'50%',border:'1px solid rgba(200,168,75,.18)'}}/>
          <div style={{position:'absolute',inset:0,borderRadius:'50%',background:'conic-gradient(from 0deg, rgba(200,168,75,.55) 0deg, rgba(200,168,75,.15) 30deg, transparent 60deg, transparent 360deg)',animation:'radarSpin 1.6s linear infinite'}}/>
          <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <div style={{width:42,height:42,borderRadius:'50%',background:'radial-gradient(circle at 35% 35%,rgba(200,168,75,.5),rgba(200,168,75,.08))',border:'1px solid rgba(200,168,75,.55)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,animation:'centerPulse 2s ease-in-out infinite'}}>⚓</div>
          </div>
        </div>
        <div className="loading-text" style={{fontFamily:"'Rajdhani',sans-serif",fontSize:11,letterSpacing:'4px',textTransform:'uppercase',color:'#c8a84b',fontWeight:700}}>
          Loading
        </div>
      </div>
    </>
  );
}
