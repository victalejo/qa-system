import emailService from './emailService';
import whatsappService from './whatsappService';
import User from '../models/User';
import BugReport from '../models/BugReport';
import Application from '../models/Application';

class NotificationService {
  /**
   * Env�a notificaci�n al tester cuando un bug pasa a "pending-test"
   */
  async notifyTesterBugPendingTest(bugId: string): Promise<void> {
    try {
      const bug = await BugReport.findById(bugId)
        .populate('reportedBy')
        .populate('application', 'name');
      if (!bug) {
        console.error('Bug not found');
        return;
      }

      const tester: any = bug.reportedBy;
      if (!tester) {
        console.error('Tester not found');
        return;
      }

      const appName = (bug.application as any)?.name || 'Aplicación';
      const preferences = tester.notificationPreferences || { email: true, whatsapp: true };

      // Enviar email si est� habilitado
      if (preferences.email && tester.email) {
        await emailService.sendBugPendingTestNotification(
          tester.email,
          tester.name,
          bug._id.toString(),
          bug.title,
          appName
        );
      }

      // Enviar WhatsApp si est� habilitado y tiene n�mero
      if (preferences.whatsapp && tester.whatsappNumber) {
        await whatsappService.sendBugPendingTestNotification(
          tester.whatsappNumber,
          tester.name,
          bug._id.toString(),
          bug.title,
          appName
        );
      }

      console.log(`Notifications sent to tester ${tester.name} for bug ${bugId}`);
    } catch (error) {
      console.error('Error sending tester notification:', error);
    }
  }

  /**
   * Env�a notificaci�n a todos los admins cuando el tester toma una decisi�n
   */
  async notifyAdminsTesterDecision(
    bugId: string,
    decision: 'fixed' | 'regression' | 'not-fixed',
    comment: string
  ): Promise<void> {
    try {
      const bug = await BugReport.findById(bugId)
        .populate('reportedBy')
        .populate('application', 'name');
      if (!bug) {
        console.error('Bug not found');
        return;
      }

      const tester: any = bug.reportedBy;
      if (!tester) {
        console.error('Tester not found');
        return;
      }

      const appName = (bug.application as any)?.name || 'Aplicación';

      // Obtener todos los admins
      const admins = await User.find({ role: 'admin' });

      // Enviar notificaci�n a cada admin
      for (const admin of admins) {
        const preferences = admin.notificationPreferences || { email: true, whatsapp: true };

        // Enviar email si est� habilitado
        if (preferences.email && admin.email) {
          await emailService.sendTesterDecisionNotification(
            admin.email,
            admin.name,
            tester.name,
            bug._id.toString(),
            bug.title,
            appName,
            decision,
            comment
          );
        }

        // Enviar WhatsApp si est� habilitado y tiene n�mero
        if (preferences.whatsapp && admin.whatsappNumber) {
          await whatsappService.sendTesterDecisionNotification(
            admin.whatsappNumber,
            admin.name,
            tester.name,
            bug._id.toString(),
            bug.title,
            appName,
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

  /**
   * Notifica a todos los QAs asignados cuando una aplicación se actualiza
   */
  async notifyQAsVersionUpdate(
    applicationId: string,
    previousVersion: string,
    newVersion: string,
    changelog: string
  ): Promise<void> {
    try {
      const application = await Application.findById(applicationId).populate('assignedQAs');
      if (!application) {
        console.error('Application not found');
        return;
      }

      const assignedQAs: any[] = application.assignedQAs || [];

      if (assignedQAs.length === 0) {
        console.log(`No QAs assigned to application ${application.name}`);
        return;
      }

      // Enviar notificación a cada QA asignado
      for (const qa of assignedQAs) {
        const preferences = qa.notificationPreferences || { email: true, whatsapp: true };

        // Enviar email si está habilitado
        if (preferences.email && qa.email) {
          await emailService.sendVersionUpdateNotification(
            qa.email,
            qa.name,
            application.name,
            previousVersion,
            newVersion,
            changelog
          );
        }

        // Enviar WhatsApp si está habilitado y tiene número
        if (preferences.whatsapp && qa.whatsappNumber) {
          await whatsappService.sendVersionUpdateNotification(
            qa.whatsappNumber,
            qa.name,
            application.name,
            previousVersion,
            newVersion,
            changelog
          );
        }
      }

      console.log(`Version update notifications sent to ${assignedQAs.length} QAs for ${application.name}`);
    } catch (error) {
      console.error('Error sending version update notifications:', error);
    }
  }

  /**
   * Notifica a los QAs asignados cuando un admin agrega un comentario en un bug
   */
  async notifyQAsAdminComment(
    bugId: string,
    commentText: string,
    adminName: string
  ): Promise<void> {
    try {
      const bug = await BugReport.findById(bugId)
        .populate('application');

      if (!bug) {
        console.error('Bug not found');
        return;
      }

      const appId = (bug.application as any)?._id;
      if (!appId) {
        console.error('Application not found for bug');
        return;
      }

      const application = await Application.findById(appId).populate('assignedQAs');
      if (!application) {
        console.error('Application not found');
        return;
      }

      const assignedQAs: any[] = application.assignedQAs || [];

      if (assignedQAs.length === 0) {
        console.log(`No QAs assigned to application ${application.name}`);
        return;
      }

      const appName = application.name;

      // Enviar notificación a cada QA asignado
      for (const qa of assignedQAs) {
        const preferences = qa.notificationPreferences || { email: true, whatsapp: true };

        // Enviar email si está habilitado
        if (preferences.email && qa.email) {
          await emailService.sendAdminCommentNotification(
            qa.email,
            qa.name,
            adminName,
            bug._id.toString(),
            bug.title,
            appName,
            commentText
          );
        }

        // Enviar WhatsApp si está habilitado y tiene número
        if (preferences.whatsapp && qa.whatsappNumber) {
          await whatsappService.sendAdminCommentNotification(
            qa.whatsappNumber,
            qa.name,
            adminName,
            bug._id.toString(),
            bug.title,
            appName,
            commentText
          );
        }
      }

      console.log(`Admin comment notifications sent to ${assignedQAs.length} QAs for bug ${bugId}`);
    } catch (error) {
      console.error('Error sending admin comment notifications:', error);
    }
  }
}

export default new NotificationService();
