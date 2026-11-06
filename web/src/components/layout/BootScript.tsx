/**
 * Script pequeno, inline e síncrono no começo do <body> (roda antes da primeira pintura, sem esperar o React):
 *
 * 1. Cabeçalho sobre o banner de tela cheia: marca `data-header-watch` no <html> e liga/desliga `data-scrolled` depois
 *    de 40 px de rolagem (chrome.css deixa o cabeçalho transparente só com `data-header-watch` e sem `data-scrolled`).
 *    Sem JavaScript, o cabeçalho fica sempre branco.
 * 2. Tela de abertura (`SplashScreen`): só na primeira página da sessão. Nas seguintes, `data-splash="off"` a esconde
 *    antes de aparecer. Na primeira, quando a página termina de carregar (e passaram pelo menos 600 ms), marca
 *    `data-splash="out"` e ela some; sem JavaScript, ela some sozinha pelo CSS (no máximo 1,8 s, motion.css).
 *
 * A CSP permite script inline (`script-src 'unsafe-inline'`, src/lib/security/csp.ts): as páginas são estáticas.
 */
const BOOT = `(function(){var d=document.documentElement;d.setAttribute('data-header-watch','');var f=0;function s(){f=0;d.toggleAttribute('data-scrolled',window.scrollY>40)}window.addEventListener('scroll',function(){if(!f)f=requestAnimationFrame(s)},{passive:true});s();try{if(sessionStorage.getItem('franccino:splash')){d.setAttribute('data-splash','off');return}sessionStorage.setItem('franccino:splash','1')}catch(e){d.setAttribute('data-splash','off');return}var t=Date.now();function o(){setTimeout(function(){d.setAttribute('data-splash','out')},Math.max(0,600-(Date.now()-t)))}if(document.readyState==='complete')o();else window.addEventListener('load',o)})();`;

export function BootScript() {
  return <script dangerouslySetInnerHTML={{ __html: BOOT }} />;
}
