import axios from 'axios';

interface WhatsAppMessage {
  chatId: string;
  text: string;
}

class WhatsAppService {
  private apiUrl: string;
  private apiKey: string;
  private session: string;

  constructor() {
    this.apiUrl = process.env.WHATSAPP_API_URL || 'https://wapi.iaportafolio.com/api/sendText';
    this.apiKey = process.env.WHATSAPP_API_KEY || '';
    this.session = process.env.WHATSAPP_SESSION || 'citrus_bitacora';
  }

  async sendMessage(phoneNumber: string, message: string): Promise<boolean> {
    try {
      // Formatear el número de teléfono al formato de WhatsApp
      // Asume que el número viene sin espacios ni caracteres especiales
      const chatId = phoneNumber.includes('@c.us') ? phoneNumber : `${phoneNumber}@c.us`;

      const response = await axios.post(
        this.apiUrl,
        {
          chatId,
          text: message,
          session: this.session
        },
        {
          headers: {
            'accept': 'application/json',
            'X-Api-Key': this.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`WhatsApp message sent successfully to ${phoneNumber}`);
      return true;
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      return false;
    }
  }

  async sendBugPendingTestNotification(
    phoneNumber: string,
    testerName: string,
    bugId: string,
    bugTitle: string,
    appName: string
  ): Promise<boolean> {
    const message = `
📋 *Bug Solucionado - Requiere Testing*

Hola *${testerName}*,

Te notificamos que el siguiente bug ha sido marcado como *solucionado* y requiere tu validación:

📱 *Aplicación:* ${appName}
🔍 *${bugTitle}*
🆔 ID: ${bugId}

Por favor, revisa el bug y selecciona una de las siguientes opciones:
✅ Completamente Solucionado
⚠️ Provocó Regresión
❌ No se Solucionó

Ingresa al sistema para evaluar el bug.

_Sistema de Gestión de QA de *IA Portafolio*_
    `.trim();

    return this.sendMessage(phoneNumber, message);
  }

  async sendTesterDecisionNotification(
    phoneNumber: string,
    adminName: string,
    testerName: string,
    bugId: string,
    bugTitle: string,
    appName: string,
    decision: 'fixed' | 'regression' | 'not-fixed',
    comment: string
  ): Promise<boolean> {
    const decisionLabels = {
      'fixed': '✅ Completamente Solucionado',
      'regression': '⚠️ Provocó Regresión',
      'not-fixed': '❌ No se Solucionó'
    };

    const message = `
📋 *Decisión del Tester sobre Bug*

Hola *${adminName}*,

El tester *${testerName}* ha evaluado el siguiente bug:

📱 *Aplicación:* ${appName}
🔍 *${bugTitle}*
🆔 ID: ${bugId}

*Decisión:* ${decisionLabels[decision]}

💬 *Comentario del Tester:*
${comment}

Ingresa al sistema para ver los detalles completos.

_Sistema de Gestión de QA de *IA Portafolio*_
    `.trim();

    return this.sendMessage(phoneNumber, message);
  }

  async sendVersionUpdateNotification(
    phoneNumber: string,
    qaName: string,
    appName: string,
    previousVersion: string,
    newVersion: string,
    changelog: string
  ): Promise<boolean> {
    const message = `
🔄 *Nueva Versión Disponible*

Hola *${qaName}*,

La aplicación *${appName}* ha sido actualizada:

📦 Versión anterior: ${previousVersion}
✅ Nueva versión: *${newVersion}*

📝 *Notas de la versión:*
${changelog}

Ingresa al sistema para más detalles.

_Sistema de Gestión de QA de *IA Portafolio*_
    `.trim();

    return this.sendMessage(phoneNumber, message);
  }

  async sendAdminCommentNotification(
    phoneNumber: string,
    qaName: string,
    adminName: string,
    bugId: string,
    bugTitle: string,
    appName: string,
    commentText: string
  ): Promise<boolean> {
    const message = `
💬 *Nuevo Comentario de Administrador*

Hola *${qaName}*,

El administrador *${adminName}* ha agregado un comentario en el siguiente bug:

📱 *Aplicación:* ${appName}
🔍 *${bugTitle}*
🆔 ID: ${bugId}

💬 *Comentario:*
${commentText}

Ingresa al sistema para ver los detalles completos.

_Sistema de Gestión de QA de *IA Portafolio*_
    `.trim();

    return this.sendMessage(phoneNumber, message);
  }
}

export default new WhatsAppService();
