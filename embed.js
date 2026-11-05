/* GageBlockCalc embed widget. Usage: <div id="gageblockcalc-widget"></div><script src="https://gageblockcalc.com/embed.js" async></script> */
(function(){var d=document,el=d.getElementById('gageblockcalc-widget');if(!el||el.getAttribute('data-gbc-ready'))return;el.setAttribute('data-gbc-ready','1');
var f=d.createElement('iframe');f.src='https://gageblockcalc.com/widget.html';f.title='Gage block stack calculator';f.loading='lazy';f.width='100%';f.height='250';f.style.cssText='border:0;max-width:340px;border-radius:10px;display:block';
el.insertBefore(f,el.firstChild);
if(!el.querySelector('a[href*="gageblockcalc.com"]')){var p=d.createElement('p');p.style.cssText='font:12px system-ui,sans-serif;margin:4px 0 0';p.innerHTML='<a href="https://gageblockcalc.com/">Gage block calculator</a> by GageBlockCalc';el.appendChild(p);}})();
