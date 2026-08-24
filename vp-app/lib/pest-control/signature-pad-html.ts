/**
 * Canvas de assinatura embutido numa WebView — mesma técnica do painel web
 * (ver resources/js/pages/app/pest-control/visits/show-visit.tsx,
 * `SignaturePad`: canvas HTML5 + eventos de ponteiro), só que React Native
 * não tem `<canvas>` nativo, então roda dentro de uma WebView local. Envia
 * mensagens JSON para o app via `window.ReactNativeWebView.postMessage`.
 */
export const SIGNATURE_PAD_HTML = `<!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
    <style>
      html, body { margin: 0; padding: 0; height: 100%; overflow: hidden; background: #fff; }
      canvas { display: block; touch-action: none; }
    </style>
  </head>
  <body>
    <canvas id="pad"></canvas>
    <script>
      const canvas = document.getElementById('pad');
      const ctx = canvas.getContext('2d');
      let drawing = false;
      let hasDrawn = false;

      function resize() {
        const ratio = window.devicePixelRatio || 1;
        canvas.width = window.innerWidth * ratio;
        canvas.height = window.innerHeight * ratio;
        canvas.style.width = window.innerWidth + 'px';
        canvas.style.height = window.innerHeight + 'px';
        ctx.scale(ratio, ratio);
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#111827';
      }
      resize();

      function post(message) {
        window.ReactNativeWebView.postMessage(JSON.stringify(message));
      }

      function pointFromEvent(event) {
        const touch = event.touches && event.touches[0];
        const rect = canvas.getBoundingClientRect();
        const clientX = touch ? touch.clientX : event.clientX;
        const clientY = touch ? touch.clientY : event.clientY;
        return { x: clientX - rect.left, y: clientY - rect.top };
      }

      function start(event) {
        drawing = true;
        const point = pointFromEvent(event);
        ctx.beginPath();
        ctx.moveTo(point.x, point.y);
        if (!hasDrawn) {
          hasDrawn = true;
          post({ type: 'drawing_started' });
        }
        event.preventDefault();
      }

      function move(event) {
        if (!drawing) return;
        const point = pointFromEvent(event);
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
        event.preventDefault();
      }

      function stop() {
        drawing = false;
      }

      canvas.addEventListener('touchstart', start, { passive: false });
      canvas.addEventListener('touchmove', move, { passive: false });
      canvas.addEventListener('touchend', stop);
      canvas.addEventListener('mousedown', start);
      canvas.addEventListener('mousemove', move);
      canvas.addEventListener('mouseup', stop);

      window.clearSignaturePad = function () {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        hasDrawn = false;
      };

      window.exportSignaturePad = function () {
        post({ type: 'export', dataUrl: canvas.toDataURL('image/png') });
      };
    </script>
  </body>
</html>`;
