import emailService from './emailService';
import whatsappService from './whatsappService';
import User from '../models/User';
import BugReport from '../models/BugReport';

class NotificationService {
  /**
   * Envía notificación al tester cuando un bug pasa a "pending-test"
   */
  async notifyTesterBugPendingTest(bugId: string): Promise<void> {
    try {
      const bug = await BugReport.findById(bugId).populate('reportedBy');
      if (!bug) {
        console.error('Bug not found');
        return;
      }

      const tester: any = bug.reportedBy;
      if (!tester) {
        console.error('Tester not found');
        return;
      }

      const preferences = tester.notificationPreferences || { email: true, whatsapp: true };

      // Enviar email si está habilitado
      if (preferences.email && tester.email) {
        await emailService.sendBugPendingTestNotification(
          tester.email,
          tester.name,
          bug._id.toString(),
          bug.title
        );
      }

      // Enviar WhatsApp si está habilitado y tiene número
      if (preferences.whatsapp && tester.whatsappNumber) {
        await whatsappService.sendBugPendingTestNotification(
          tester.whatsappNumber,
          tester.name,
          bug._id.toString(),
          bug.title
        );
      }

      console.log(`Notifications sent to tester ${tester.name} for bug ${bugId}`);
    } catch (error) {
      console.error('Error sending tester notification:', error);
    }
  }

  /**
   * Envía notificación a todos los admins cuando el tester toma una decisión
   */
  async notifyAdminsTesterDecision(
    bugId: string,
    decision: 'fixed' | 'regression' | 'not-fixed',
    comment: string
  ): Promise<void> {
    try {
      const bug = await BugReport.findById(bugId).populate('reportedBy');
      if (!bug) {
        console.error('Bug not found');
        return;
      }

      const tester: any = bug.reportedBy;
      if (!tester) {
        console.error('Tester not found');
        return;
      }

      // Obtener todos los admins
      const admins = await User.find({ role: 'admin' });

      // Enviar notificación a cada admin
      for (const admin of admins) {
        const preferences = admin.notificationPreferences || { email: true, whatsapp: true };

        // Enviar email si está habilitado
        if (preferences.email && admin.email) {
          await emailService.sendTesterDecisionNotification(
            admin.email,
            admin.name,
            tester.name,
            bug._id.toString(),
            bug.title,
            decision,
            comment
          );
        }

        // Enviar WhatsApp si está habilitado y tiene número
        if (preferences.whatsapp && admin.whatsappNumber) {
          await whatsappService.sendTesterDecisionNotification(
            admin.whatsappNumber,
            admin.name,
            tester.name,
            bug._id.toString(),
            bug.title,
            decision,
            comment
          );
        }
      }

      console.log(`Notifications sent to ${admins.length} admins for bug ${bugId}`);
    } catch (error) {
      console.error('Error sending admin notifications:', error);
    }
  }
}

export default new NotificationService();
