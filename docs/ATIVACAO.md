# Casa Aura — ativação da loja

O projeto usa Next.js App Router, React, TypeScript, Tailwind CSS e Supabase via HTTPS. Foi preparado para Vercel. O adaptador Vinext do ambiente Sites é usado somente na prévia interna; a compilação de produção é Next.js real.

## Estado entregue

- Home, coleção com filtros e ordenação, produto com galeria, sacola e checkout.
- Imagens ilustrativas otimizadas em WebP. Substituir pelas fotografias reais antes das vendas.
- Seis produtos e preços fictícios, claramente identificados como demonstração.
- Painel com prévia de edição; persistência, login e upload real habilitados ao conectar Supabase.
- Integrações implementadas, ainda não homologadas com contas reais: Pix QR e copia e cola, cartão via Checkout Pro, frete Melhor Envio, e-mails Resend.
- Banner de cookies, escolha essencial/opcional e política de privacidade. Sem rastreadores opcionais instalados.
- O número de WhatsApp não foi informado. O botão abre uma conversa explicativa e oferece o Instagram real da referência até a configuração.
- Interface em português. Inglês, solicitado como opcional, não foi incluído.
- Publicação Vercel depende do acesso à conta da marca. Nenhum domínio ou serviço pago foi contratado.
- A meta Lighthouse acima de 90 não foi aferida. Auditar a publicação de produção em desktop e mobile.

## 1. Executar no Windows

Instale Node.js 22.13 ou superior. O Node 24 do seu computador atende ao projeto.

```powershell
cd "C:\caminho\casa-aura"
corepack enable
corepack pnpm install --frozen-lockfile
Copy-Item .env.example .env.local
corepack pnpm dev:next
```

Abra o endereço mostrado no terminal, normalmente http://localhost:3000.
Sem preencher variáveis, o catálogo demonstrativo funciona e as cobranças ficam bloqueadas.
Se o Corepack não estiver instalado, instale a versão de pnpm declarada em `packageManager` do package.json; não troque o lockfile por outro gerenciador.

```powershell
corepack pnpm typecheck
node tests/security.mjs
corepack pnpm build
corepack pnpm start
```

## 2. Supabase

1. Crie um projeto Supabase da marca.
2. Execute `supabase/schema.sql` no SQL Editor uma única vez. O script cria tabelas, RLS, funções privadas, índices e bucket de imagens.
3. Configure SUPABASE_URL, SUPABASE_ANON_KEY e SUPABASE_SERVICE_ROLE_KEY somente no ambiente do servidor. Não use prefixo NEXT_PUBLIC para chaves privadas.
4. Crie o usuário administrador em Authentication > Users. Desative cadastro público caso não seja usado.
5. Autorize explicitamente o UUID desse usuário:

```sql
insert into public.app_admins(user_id)
values ('UUID-DO-USUARIO-CRIADO');
```

6. Entre em /admin, use “Nova peça”, envie fotos reais e preencha descrições, preços e dimensões embaladas.
7. Marque “Visível na loja”. Com Supabase conectado, os exemplos locais deixam de aparecer; o catálogo começa vazio.

O campo interno `stock` representa disponibilidade e limite por compra. Não existe reserva nem baixa automática de estoque nesta versão. Não use o limite como controle de estoque físico concorrente. Para peças únicas, implemente reserva transacional antes de abrir vendas simultâneas.
A sessão administrativa é HttpOnly, validada no servidor e expira em no máximo uma hora. Não há recuperação de senha própria; utilize Supabase Auth.

## 3. Pagamentos Mercado Pago

- Cadastre a aplicação da marca, configure a chave Pix da conta e use credenciais adequadas para os testes.
- Preencha MERCADO_PAGO_ACCESS_TOKEN e MERCADO_PAGO_WEBHOOK_SECRET no servidor.
- Cadastre o webhook HTTPS: `https://SEU-DOMINIO/api/webhooks/mercadopago`, com eventos de pagamentos.
- Pix usa a API /v1/payments, gera QR real e desconta 5% do subtotal das peças, sem descontar o frete.
- Cartão abre Checkout Pro e limita as parcelas a 12. Juros e disponibilidade dependem da conta e do emissor, e são apresentados no Mercado Pago.
- MERCADO_PAGO_SANDBOX seleciona o link sandbox do Checkout Pro. As credenciais determinam o modo da API Pix; siga o fluxo de teste oferecido pela sua integração Mercado Pago.
- O servidor recalcula preços e frete. Quando o total muda, a compra é interrompida para revisão.
- Idempotência associa uma tentativa a um pedido. A aprovação requer assinatura válida e consulta do pagamento diretamente no Mercado Pago; parâmetros da URL de retorno não aprovam pedidos.
- Faça homologação de aprovado, pendente, rejeitado, expirado, cancelado, reembolso e webhook repetido. Um novo pagamento para o mesmo pedido com ID divergente exige revisão manual; nunca reenviar automaticamente para expedição.
- Estorno/reembolso é operado no Mercado Pago; esta loja recebe a atualização de status. A versão não inclui uma tela própria de reembolso.

## 4. Frete

Configure MELHOR_ENVIO_TOKEN, MELHOR_ENVIO_SANDBOX e SHIPPING_ORIGIN_CEP. HANDLING_DAYS acrescenta o prazo de preparação ao prazo retornado. Cadastre peso em kg e dimensões em cm, incluindo a embalagem.
O site faz cotações reais e registra a modalidade. Compra de etiquetas e contratação do envio continuam na conta Melhor Envio. Não são feitas automaticamente.

## 5. E-mails

Verifique um domínio remetente no Resend e configure RESEND_API_KEY, EMAIL_FROM e PRIVACY_EMAIL.

- Confirmação: após webhook de pagamento aprovado.
- Envio: ao informar rastreio e marcar “enviado” no painel.
- Pós-venda: sete dias após a entrega confirmada manualmente no painel.
- Fila durável no Supabase, chave idempotente e tentativas limitadas. Veja `email_outbox.last_error` e `attempts` para acompanhar falhas.
- `vercel.json` agenda /api/cron/emails diariamente às 12:00 UTC. Configure CRON_SECRET. Ajuste a frequência conforme o plano contratado. Em lojas movimentadas, aumente a frequência e a quantidade processada antes de operar.
- Após 8 tentativas a fila exige intervenção. O envio externo e a atualização do banco não são uma transação única; Resend aplica sua janela de deduplicação. Monitorar falhas longas evita reenvios tardios.

## 6. Identidade da marca e privacidade

Preencha LEGAL_BUSINESS_NAME, BUSINESS_TAX_ID, PRIVACY_EMAIL e WHATSAPP_NUMBER (55 + DDD + número, apenas dígitos). Troque fotos, preços e características pelos reais. Confirme a política publicada, os prazos de retenção e os prestadores antes de ativar a venda.
A política é uma base operacional, não uma certificação jurídica de conformidade. O banner não instala rastreadores e permite alterar a escolha no rodapé.
Não há newsletter. Os e-mails implementados são exclusivamente transacionais/de cuidado pós-compra.

## 7. Publicar na Vercel

1. Suba este projeto em um repositório da marca, sem .env.local, segredos ou node_modules.
2. Importe o repositório na conta Vercel e selecione Next.js.
3. Preserve `pnpm-lock.yaml`. O vercel.json já define instalação e build.
4. Adicione as variáveis do .env.example. Gere segredos únicos para CRON_SECRET, ORDER_TOKEN_SECRET e RATE_LIMIT_SALT.
5. Ajuste NEXT_PUBLIC_SITE_URL para o endereço HTTPS definitivo e publique novamente.
6. Mantenha LIVE_CHECKOUT_ENABLED=false durante a revisão. Os administradores podem configurar o catálogo sem cobrar clientes.
7. Depois de conferir todos os dados e homologar os provedores em sandbox, ative LIVE_CHECKOUT_ENABLED=true e publique novamente. Para produção, substitua credenciais e desative flags sandbox de acordo com os provedores.
8. Teste uma compra real supervisionada pela marca, sem expor credenciais no chat, antes de divulgar a loja.

## 8. Medir desempenho

Use Chrome Lighthouse na versão de produção, com aba anônima e sem extensões, em mobile e desktop. Audite Home, Loja e Produto. Registre Performance, Accessibility, Best Practices e SEO; a meta solicitada é >90.
As otimizações já aplicadas incluem WebP, dimensões reservadas, lazy loading abaixo da dobra, prioridade para a imagem principal, cache das imagens e fontes locais do sistema.
Não meça o servidor de desenvolvimento para atestar performance final. A loja demonstrativa usa noindex; ative indexação somente para o domínio e catálogo reais.

## Referências técnicas consultadas

- https://nextjs.org/docs/app/getting-started/deploying
- https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
- https://www.mercadopago.com.br/developers/pt/docs/checkout-bricks/payment-brick/payment-submission/pix
- https://www.mercadopago.com.br/developers/pt/docs/checkout-pro-preferences/additional-settings/payment-methods
- https://www.mercadopago.com.br/developers/pt/docs/wallet-connect/notifications
- https://docs.melhorenvio.com.br/reference/calculo-de-fretes-por-produtos
- https://resend.com/docs/api-reference/emails/send-email
- https://www.gov.br/anpd/pt-br/documentos-e-publicacoes/guia-orientativo-cookies-e-protecao-de-dados-pessoais.pdf
