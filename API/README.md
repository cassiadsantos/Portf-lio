Deploy rápido no GitHub Pages

1) Inicializar repositório (se ainda não):
   git init
   git add .
   git commit -m "Initial"
   gh repo create <nome-do-repo> --public --source=. --remote=origin
   git push -u origin main

2) Publicar via GitHub Pages:
   - No GitHub, vá em Settings → Pages → Branch: choose 'main' / root → Save.
   - Aguarde alguns minutos e abra https://<seu-usuario>.github.io/<nome-do-repo>/

Observações de segurança:
- A chave MAPTILER_KEY está embutida em config.js e será pública.
- No MapTiler Dashboard, restrinja a chave por HTTP referrer (domínio do seu site) e rotacione se comprometida.
- Melhor solução: mover para proxy/server (Cloudflare Workers, Netlify/Vercel functions) para não expor a chave.

Recomendado após deploy:
- Criar proxy para /api/geocode e /api/viacep para evitar expor detalhes e aplicar rate-limit.
- Usar MapTiler restrictions e monitorar uso.

Se quiser, eu: 1) crio o repo e faço o push (preciso de acesso), 2) gero um Cloudflare Worker para proxy sem Node.js, ou 3) configurar Netlify deploy automático.