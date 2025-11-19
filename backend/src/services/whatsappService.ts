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
    bugTitle: string
  ): Promise<boolean> {
    const message = `
= *Bug Solucionado - Requiere Testing*

Hola *${testerName}*,

Te notificamos que el siguiente bug ha sido marcado como *solucionado* y requiere tu validación:

=Ë *${bugTitle}*
<” ID: ${bugId}

Por favor, revisa el bug y selecciona una de las siguientes opciones:
 Completamente Solucionado
  Provocó Regresión
L No se Solucionó

Ingresa al sistema para evaluar el bug.

_Sistema de Gestión de QA_
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
      'regression': 'Provocó Regresión  ',
      'not-fixed': 'No se Solucionó L'
    };

    const message = `
= *Decisión del Tester sobre Bug*

Hola *${adminName}*,

El tester *${testerName}* ha evaluado el siguiente bug:

=Ë *${bugTitle}*
<” ID: ${bugId}

*Decisión:* ${decisionLabels[decision]}

=¬ *Comentario del Tester:*
${comment}

Ingresa al sistema para ver los detalles completos.

_Sistema de Gestión de QA_
    `.trim();

    return this.sendMessage(phoneNumber, message);
  }
}

export default new WhatsAppService();
