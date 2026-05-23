import Link from 'next/link';

export default function NotFound() {
  const g = { color: '#c8a84b' };
  const rj = "'Rajdhani',sans-serif";
  const lb = "'Libre Baskerville',serif";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Outfit:wght@300;400;500;600;700&family=Rajdhani:wght@500;600;700&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;}
        body{background:#08100a;overflow-x:hidden;}
        @keyframes wave{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes rotate{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:.6}50%{opacity:1}}
        .four-zero-four{animation:wave 3s ease-in-out infinite;}
        .compass-spin{animation:rotate 20s linear infinite;}
        .pulse-text{animation:pulse 2.5s ease-in-out infinite;}
        .btn-gold:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(200,168,75,.35);filter:brightness(1.08);}
        .btn-ghost:hover{background:rgba(200,168,75,.12);border-color:#c8a84b!important;}
        .btn-gold,.btn-ghost{transition:transform .25s ease, box-shadow .25s ease, filter .25s ease, background .25s, border-color .25s;}
        @media(max-width:768px){
          .nf-wrap{padding:80px 20px 40px!important;}
          .nf-404{font-size:140px!important;}
          .nf-h1{font-size:24px!important;}
        }
      `}</style>

      <div style={{background:'#08100a',color:'#f5f0e8',fontFamily:"'Outfit',sans-serif",minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}>
        <div className="nf-wrap" style={{padding:'60px 40px',textAlign:'center',maxWidth:720,width:'100%'}}>

          {/* Big compass behind 404 */}
          <div style={{position:'relative',display:'inline-block',marginBottom:14}}>
            <svg className="compass-spin" width="120" height="120" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{opacity:.18,position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)'}}>
              <circle cx="50" cy="50" r="44" fill="none" stroke="#c8a84b" strokeWidth="2.5"/>
              <circle cx="50" cy="50" r="36" fill="none" stroke="#c8a84b" strokeWidth="0.6"/>
              <polygon points="50,15 56,50 50,50" fill="#f5f0e8"/>
              <polygon points="50,15 44,50 50,50" fill="#c8a84b"/>
              <polygon points="50,85 56,50 50,50" fill="#c8a84b"/>
              <polygon points="50,85 44,50 50,50" fill="#f5f0e8"/>
              <polygon points="85,50 50,44 50,50" fill="#c8a84b"/>
              <polygon points="85,50 50,56 50,50" fill="#f5f0e8"/>
              <polygon points="15,50 50,44 50,50" fill="#f5f0e8"/>
              <polygon points="15,50 50,56 50,50" fill="#c8a84b"/>
            </svg>
            <div className="four-zero-four nf-404" style={{fontFamily:lb,fontSize:180,fontWeight:700,lineHeight:1,color:'#c8a84b',position:'relative',textShadow:'0 4px 20px rgba(200,168,75,.25)',letterSpacing:-6}}>
              404
            </div>
          </div>

          <div className="pulse-text" style={{fontFamily:rj,fontSize:11,letterSpacing:'4px',textTransform:'uppercase',color:'#c8a84b',marginBottom:20,fontWeight:700}}>
            <span style={{display:'inline-block',width:32,height:1,background:'#c8a84b',verticalAlign:'middle',marginRight:12,opacity:.5}}/>
            Lost at Sea
            <span style={{display:'inline-block',width:32,height:1,background:'#c8a84b',verticalAlign:'middle',marginLeft:12,opacity:.5}}/>
          </div>

          <h1 className="nf-h1" style={{fontFamily:lb,fontSize:34,fontWeight:700,lineHeight:1.15,marginBottom:14}}>
            This page sailed <em style={g}>away</em>
          </h1>
          <p style={{fontSize:15,lineHeight:1.8,color:'#b0c0a4',maxWidth:480,margin:'0 auto 32px'}}>
            The page you&apos;re looking for has drifted off course or doesn&apos;t exist. Let&apos;s help you get back to safe harbor.
          </p>

          <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
            <Link href="/" className="btn-gold" style={{background:'#c8a84b',color:'#08100a',border:'none',padding:'13px 28px',fontFamily:rj,fontSize:12,letterSpacing:'2px',textTransform:'uppercase',fontWeight:700,textDecoration:'none'}}>⚓ Return to Home</Link>
            <Link href="/blog" className="btn-ghost" style={{background:'transparent',color:'#c8a84b',border:'1px solid rgba(200,168,75,.4)',padding:'12px 24px',fontFamily:rj,fontSize:12,letterSpacing:'2px',textTransform:'uppercase',fontWeight:700,textDecoration:'none'}}>📚 Browse Guides</Link>
          </div>

          <div style={{marginTop:42,paddingTop:24,borderTop:'1px solid rgba(200,168,75,.15)',fontFamily:rj,fontSize:10,letterSpacing:'1.5px',color:'#5a6a52',fontWeight:600}}>
            <span style={{textTransform:'uppercase'}}>Need help finding something?</span>{' '}
            <Link href="/contact" style={{color:'#c8a84b',textDecoration:'none',marginLeft:6}}>Contact us →</Link>
          </div>

        </div>
      </div>
    </>
  );
}
