import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_USER,
        to: options.to,
        subject: options.subject,
        html: options.html,
        encoding: 'utf-8',
        headers: {
          'Content-Type': 'text/html; charset=utf-8'
        }
      });
      console.log(`Email sent successfully to ${options.to}`);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  async sendBugPendingTestNotification(
    testerEmail: string,
    testerName: string,
    bugId: string,
    bugTitle: string,
    appName: string
  ): Promise<boolean> {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const subject = `🐛 Bug Solucionado - Requiere Testing [${appName}]`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Bug Solucionado - Por Testear</h2>
        <p>Hola <strong>${testerName}</strong>,</p>
        <p>Te notificamos que el siguiente bug ha sido marcado como <strong>solucionado</strong> y requiere tu validación:</p>

        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="color: #6b7280; margin: 5px 0;"><strong>Aplicación:</strong> ${appName}</p>
          <h3 style="margin-top: 0; color: #1f2937;">${bugTitle}</h3>
          <p style="color: #6b7280; margin: 5px 0;"><strong>ID:</strong> ${bugId}</p>
        </div>

        <p>Por favor, revisa el bug y selecciona una de las siguientes opciones:</p>
        <ul>
          <li><strong>Completamente Solucionado:</strong> El bug fue resuelto correctamente</li>
          <li><strong>Provocó Regresión:</strong> La solución causó nuevos problemas</li>
          <li><strong>No se Solucionó:</strong> El bug persiste</li>
        </ul>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${frontendUrl}"
             style="background-color: #2563eb; color: white; padding: 12px 30px;
                    text-decoration: none; border-radius: 6px; display: inline-block;">
            Ver Bug y Testear
          </a>
        </div>

        <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
          Este es un mensaje automático del Sistema de Gestión de QA.
        </p>
      </div>
    `;

    return this.sendEmail({ to: testerEmail, subject, html });
  }

  async sendTesterDecisionNotification(
    adminEmail: string,
    adminName: string,
    testerName: string,
    bugId: string,
    bugTitle: string,
    appName: string,
    decision: 'fixed' | 'regression' | 'not-fixed',
    comment: string
  ): Promise<boolean> {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    const decisionLabels = {
      'fixed': 'Completamente Solucionado ✅',
      'regression': 'Provocó Regresión ⚠️',
      'not-fixed': 'No se Solucionó ❌'
    };

    const decisionColors = {
      'fixed': '#10b981',
      'regression': '#f59e0b',
      'not-fixed': '#ef4444'
    };

    const subject = `📋 Decisión del Tester: ${bugTitle} [${appName}]`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Decisión del Tester sobre Bug</h2>
        <p>Hola <strong>${adminName}</strong>,</p>
        <p>El tester <strong>${testerName}</strong> ha evaluado el siguiente bug:</p>

        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="color: #6b7280; margin: 5px 0;"><strong>Aplicación:</strong> ${appName}</p>
          <h3 style="margin-top: 0; color: #1f2937;">${bugTitle}</h3>
          <p style="color: #6b7280; margin: 5px 0;"><strong>ID:</strong> ${bugId}</p>
        </div>

        <div style="background-color: ${decisionColors[decision]}; color: white;
                    padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <h3 style="margin: 0;">${decisionLabels[decision]}</h3>
        </div>

        <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #374151;"><strong>Comentario del Tester:</strong></p>
          <p style="margin: 10px 0 0 0; color: #6b7280;">${comment}</p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${frontendUrl}"
             style="background-color: #2563eb; color: white; padding: 12px 30px;
                    text-decoration: none; border-radius: 6px; display: inline-block;">
            Ver Detalles del Bug
          </a>
        </div>

        <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
          Este es un mensaje automático del Sistema de Gestión de QA.
        </p>
      </div>
    `;

    return this.sendEmail({ to: adminEmail, subject, html });
  }

  async sendVersionUpdateNotification(
    qaEmail: string,
    qaName: string,
    appName: string,
    previousVersion: string,
    newVersion: string,
    changelog: string
  ): Promise<boolean> {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const subject = `🔄 Nueva Versión: ${appName} v${newVersion}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">🔄 Nueva Versión Disponible</h2>
        <p>Hola <strong>${qaName}</strong>,</p>
        <p>Te notificamos que la aplicación <strong>${appName}</strong> ha sido actualizada:</p>

        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Versión anterior:</strong> ${previousVersion}</p>
          <p style="margin: 5px 0;"><strong>Nueva versión:</strong> <span style="color: #10b981; font-weight: bold;">${newVersion}</span></p>
        </div>

        <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #374151;"><strong>📝 Notas de la versión:</strong></p>
          <p style="margin: 10px 0 0 0; color: #6b7280; white-space: pre-wrap;">${changelog}</p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${frontendUrl}"
             style="background-color: #2563eb; color: white; padding: 12px 30px;
                    text-decoration: none; border-radius: 6px; display: inline-block;">
            Ir al Sistema de QA
          </a>
        </div>

        <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
          Este es un mensaje automático del Sistema de Gestión de QA.
        </p>
      </div>
    `;

    return this.sendEmail({ to: qaEmail, subject, html });
  }
}

export default new EmailService();
