/**
 * Script pequeno, inline e síncrono no começo do <body> (roda antes da primeira pintura, sem esperar o React):
 *
 * 1. Cabeçalho sobre o banner de tela cheia: marca `data-header-watch` no <html> e liga/desliga `data-scrolled` depois
 *    de 40 px de rolagem (chrome.css deixa o cabeçalho transparente só com `data-header-watch` e sem `data-scrolled`).
 *    Sem JavaScript, o cabeçalho fica sempre branco. Rolando para baixo (depois de 160 px), marca `data-header-hide` e o
 *    cabeçalho sai de cena; qualquer rolagem para cima o traz de volta (revisão da Franccino, 12/11/2026, como no
 *    viccarbe.com). Com um menu ou a busca abertos, ele fica (chrome.css).
 * 2. Tela de abertura (`SplashScreen`): só na primeira página da sessão. Nas seguintes, `data-splash="off"` a esconde
 *    antes de aparecer. Na primeira, quando a página termina de carregar (e passaram pelo menos 600 ms), marca
 *    `data-splash="out"` e ela some; sem JavaScript, ela some sozinha pelo CSS (no máximo 1,8 s, motion.css).
 *
 * 3. Fotos (`ApiImage`, `data-img`): marca `data-img-fade` no <html> e, em cada foto, `data-loaded="late"` quando ela
 *    chega (ou falha) e `data-loaded="instant"` quando já estava no cache ao entrar na página. Enquanto não chega, a foto
 *    mostra um placeholder suave; ao chegar, aparece com um fade; do cache, aparece sem animar (motion.css). Sem
 *    JavaScript nada disso vale e a foto aparece como sempre.
 *
 * A CSP permite script inline (`script-src 'unsafe-inline'`, src/lib/security/csp.ts): as páginas são estáticas.
 */
const BOOT = `(function(){var d=document.documentElement;d.setAttribute('data-img-fade','');function L(e){var t=e.target;if(t&&t.tagName==='IMG'&&t.hasAttribute('data-img')&&!t.hasAttribute('data-loaded'))t.setAttribute('data-loaded','late')}document.addEventListener('load',L,true);document.addEventListener('error',L,true);function I(n){if(n.nodeType!==1)return;var l=n.tagName==='IMG'?[n]:n.querySelectorAll?n.querySelectorAll('img[data-img]'):[];for(var i=0;i<l.length;i++){var g=l[i];if(g.hasAttribute('data-img')&&!g.hasAttribute('data-loaded')&&g.complete&&g.naturalWidth)g.setAttribute('data-loaded','instant')}}new MutationObserver(function(r){for(var i=0;i<r.length;i++)for(var j=0;j<r[i].addedNodes.length;j++)I(r[i].addedNodes[j])}).observe(d,{childList:true,subtree:true});d.setAttribute('data-header-watch','');var f=0;var y0=window.scrollY;function s(){f=0;var y=window.scrollY;d.toggleAttribute('data-scrolled',y>40);if(y<160||y<y0-4)d.removeAttribute('data-header-hide');else if(y>y0+4)d.setAttribute('data-header-hide','');if(Math.abs(y-y0)>4)y0=y}window.addEventListener('scroll',function(){if(!f)f=requestAnimationFrame(s)},{passive:true});s();try{if(sessionStorage.getItem('franccino:splash')){d.setAttribute('data-splash','off');return}sessionStorage.setItem('franccino:splash','1')}catch(e){d.setAttribute('data-splash','off');return}var t=Date.now();function o(){setTimeout(function(){d.setAttribute('data-splash','out')},Math.max(0,600-(Date.now()-t)))}if(document.readyState==='complete')o();else window.addEventListener('load',o)})();`;

export function BootScript() {
  return <script dangerouslySetInnerHTML={{ __html: BOOT }} />;
}
