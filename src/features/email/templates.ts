export const emailTemplates = {
  welcome: (name: string) => ({
    subject: 'Bem-vindo ao Futly Go! ⚽',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto; color: #05070B; background: #F3F6FB; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <h1 style="color: #22B76C; margin: 0 0 16px 0;">Bem-vindo, ${name}!</h1>
          <p style="margin: 0 0 16px 0; color: #5B6B80;">Sua conta foi criada com sucesso no Futly Go. Agora você pode descobrir e criar partidas de futsal, society e campo.</p>
          <a href="https://futlygo.vercel.app" style="display: inline-block; background: #22B76C; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">Começar Agora</a>
          <hr style="border: none; border-top: 1px solid #D1DCEB; margin: 24px 0;">
          <p style="color: #5B6B80; font-size: 12px; margin: 0;">© 2024 Futly Go. Todos os direitos reservados.</p>
        </div>
      </div>
    `,
  }),

  confirmSignup: (name: string, confirmationUrl: string) => ({
    subject: 'Confirme seu cadastro no Futly Go',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto; color: #05070B; background: #F3F6FB; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <h1 style="color: #22B76C; margin: 0 0 16px 0;">Confirme seu e-mail</h1>
          <p style="margin: 0 0 16px 0; color: #5B6B80;">Olá, ${name}. Clique no botão abaixo para ativar sua conta no Futly Go.</p>
          <a href="${confirmationUrl}" style="display: inline-block; background: #22B76C; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">Confirmar cadastro</a>
          <p style="margin: 18px 0 0 0; color: #5B6B80; font-size: 13px;">Se o botão não funcionar, copie e cole este link no navegador:</p>
          <p style="word-break: break-all; color: #1F2937; font-size: 13px;">${confirmationUrl}</p>
        </div>
      </div>
    `,
  }),

  passwordResetCode: (code: string) => ({
    subject: 'Código para redefinir sua senha Futly Go',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto; color: #05070B; background: #F3F6FB; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <h1 style="color: #22B76C; margin: 0 0 16px 0;">Redefinir senha</h1>
          <p style="margin: 0 0 16px 0; color: #5B6B80;">Use o código abaixo no app para continuar a redefinição da senha.</p>
          <div style="font-size: 32px; letter-spacing: 8px; font-weight: 800; color: #05070B; background: #F3F6FB; border-radius: 10px; padding: 16px; text-align: center;">${code}</div>
          <p style="margin: 16px 0 0 0; color: #5B6B80; font-size: 13px;">Se você não solicitou este código, ignore este e-mail.</p>
        </div>
      </div>
    `,
  }),

  matchCreated: (hostName: string, matchTitle: string, date: string, time: string) => ({
    subject: `Sua partida foi criada! 🎉`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto; color: #05070B; background: #F3F6FB; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 24px;">
          <h1 style="color: #22B76C; margin: 0 0 16px 0;">Partida Criada! ⚽</h1>
          <p style="margin: 0 0 12px 0;"><strong>${matchTitle}</strong></p>
          <p style="color: #5B6B80; margin: 0 0 12px 0;">📅 ${date} às ${time}</p>
          <p style="color: #5B6B80; margin: 0;">Você está recebendo atualizações sobre sua partida no app Futly Go.</p>
        </div>
      </div>
    `,
  }),

  playerJoined: (playerName: string, matchTitle: string, date: string, time: string) => ({
    subject: `${playerName} confirmou presença! 🎯`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto; color: #05070B; background: #F3F6FB; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 24px;">
          <h1 style="color: #22B76C; margin: 0 0 16px 0;">Nova Confirmação! 🎯</h1>
          <p style="margin: 0 0 12px 0;"><strong>${playerName}</strong> confirmou presença em <strong>${matchTitle}</strong></p>
          <p style="color: #5B6B80; margin: 0;">📅 ${date} às ${time}</p>
        </div>
      </div>
    `,
  }),

  playerConfirmation: (playerName: string, matchTitle: string, location: string, date: string, time: string) => ({
    subject: `Você confirmou na partida! ✅`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto; color: #05070B; background: #F3F6FB; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 24px;">
          <h1 style="color: #22B76C; margin: 0 0 16px 0;">Confirmado! ✅</h1>
          <p style="margin: 0 0 12px 0;"><strong>${matchTitle}</strong></p>
          <p style="color: #5B6B80; margin: 0 0 8px 0;">📍 ${location}</p>
          <p style="color: #5B6B80; margin: 0;">📅 ${date} às ${time}</p>
        </div>
      </div>
    `,
  }),
};
