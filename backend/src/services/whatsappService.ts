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
      // Formatear el n�mero de tel�fono al formato de WhatsApp
      // Asume que el n�mero viene sin espacios ni caracteres especiales
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
    bugTitle: string
  ): Promise<boolean> {
    const message = `
= *Bug Solucionado - Requiere Testing*

Hola *${testerName}*,

Te notificamos que el siguiente bug ha sido marcado como *solucionado* y requiere tu validaci�n:

=� *${bugTitle}*
<� ID: ${bugId}

Por favor, revisa el bug y selecciona una de las siguientes opciones:
 Completamente Solucionado
� Provoc� Regresi�n
L No se Solucion�

Ingresa al sistema para evaluar el bug.

_Sistema de Gesti�n de QA_
    `.trim();

    return this.sendMessage(phoneNumber, message);
  }

  async sendTesterDecisionNotification(
    phoneNumber: string,
    adminName: string,
    testerName: string,
    bugId: string,
    bugTitle: string,
    decision: 'fixed' | 'regression' | 'not-fixed',
    comment: string
  ): Promise<boolean> {
    const decisionLabels = {
      'fixed': 'Completamente Solucionado ',
      'regression': 'Provoc� Regresi�n �',
      'not-fixed': 'No se Solucion� L'
    };

    const message = `
= *Decisi�n del Tester sobre Bug*

Hola *${adminName}*,

El tester *${testerName}* ha evaluado el siguiente bug:

=� *${bugTitle}*
<� ID: ${bugId}

*Decisi�n:* ${decisionLabels[decision]}

=� *Comentario del Tester:*
${comment}

Ingresa al sistema para ver los detalles completos.

_Sistema de Gesti�n de QA_
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

_Sistema de Gestión de QA_
    `.trim();

    return this.sendMessage(phoneNumber, message);
  }
}

export default new WhatsAppService();
