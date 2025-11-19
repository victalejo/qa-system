import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import StepIndicator from './StepIndicator';
import Step1BasicInfo from './steps/Step1BasicInfo';
import Step2Description from './steps/Step2Description';
import Step3Behavior from './steps/Step3Behavior';
import Step4TechnicalErrors from './steps/Step4TechnicalErrors';
import Step5Evidence from './steps/Step5Evidence';
import Step6Review from './steps/Step6Review';
import './BugReportWizard.css';

interface Application {
  _id: string;
  name: string;
  version: string;
}

interface BugReportWizardProps {
  applications: Application[];
  onClose: () => void;
  onSuccess: () => void;
}

const BugReportWizard: React.FC<BugReportWizardProps> = ({
  applications,
  onClose,
  onSuccess
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');

  // Datos del formulario
  const [selectedApp, setSelectedApp] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [stepsToReproduce, setStepsToReproduce] = useState('');
  const [expectedBehavior, setExpectedBehavior] = useState('');
  const [actualBehavior, setActualBehavior] = useState('');
  const [consoleErrors, setConsoleErrors] = useState('');
  const [queries, setQueries] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [severity, setSeverity] = useState('medium');
  const [environment, setEnvironment] = useState('');

  const steps = [
    { number: 1, title: 'Información Básica' },
    { number: 2, title: 'Descripción' },
    { number: 3, title: 'Comportamiento' },
    { number: 4, title: 'Errores Técnicos' },
    { number: 5, title: 'Evidencias' },
    { number: 6, title: 'Revisión' }
  ];

  // Auto-guardar en localStorage
  useEffect(() => {
    const draft = {
      selectedApp,
      title,
      description,
      stepsToReproduce,
      expectedBehavior,
      actualBehavior,
      consoleErrors,
      queries,
      severity,
      environment
    };
    localStorage.setItem('bugReportDraft', JSON.stringify(draft));
  }, [selectedApp, title, description, stepsToReproduce, expectedBehavior, actualBehavior, consoleErrors, queries, severity, environment]);

  // Cargar borrador al montar
  useEffect(() => {
    const savedDraft = localStorage.getItem('bugReportDraft');
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        setSelectedApp(draft.selectedApp || '');
        setTitle(draft.title || '');
        setDescription(draft.description || '');
        setStepsToReproduce(draft.stepsToReproduce || '');
        setExpectedBehavior(draft.expectedBehavior || '');
        setActualBehavior(draft.actualBehavior || '');
        setConsoleErrors(draft.consoleErrors || '');
        setQueries(draft.queries || '');
        setSeverity(draft.severity || 'medium');
        setEnvironment(draft.environment || '');
      } catch (e) {
        console.error('Error loading draft:', e);
      }
    }
  }, []);

  const validateStep = (step: number): boolean => {
    setError('');

    switch (step) {
      case 0: // Paso 1
        if (!selectedApp) {
          setError('Por favor selecciona una aplicación');
          return false;
        }
        if (!title.trim()) {
          setError('Por favor proporciona un título');
          return false;
        }
        return true;

      case 1: // Paso 2
        if (!description.trim()) {
          setError('Por favor proporciona una descripción');
          return false;
        }
        if (!stepsToReproduce.trim()) {
          setError('Por favor proporciona los pasos para reproducir');
          return false;
        }
        return true;

      case 2: // Paso 3
        if (!expectedBehavior.trim()) {
          setError('Por favor describe el comportamiento esperado');
          return false;
        }
        if (!actualBehavior.trim()) {
          setError('Por favor describe el comportamiento actual');
          return false;
        }
        return true;

      case 3: // Paso 4 (Errores técnicos - opcionales)
        return true;

      case 4: // Paso 5 (Evidencias - opcionales)
        return true;

      case 5: // Paso 6
        if (!severity) {
          setError('Por favor selecciona la severidad');
          return false;
        }
        if (!environment.trim()) {
          setError('Por favor especifica el entorno');
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handlePrevious = () => {
    setError('');
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const uploadImages = async (): Promise<string[]> => {
    if (images.length === 0) return [];

    const formData = new FormData();
    images.forEach((image) => {
      formData.append('screenshots', image);
    });

    try {
      const response = await api.post('/upload/screenshots', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data.files;
    } catch (error) {
      console.error('Error uploading images:', error);
      throw new Error('Error al subir las imágenes');
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Primero subir las imágenes
      const uploadedImageUrls = await uploadImages();

      // Luego crear el reporte
      await api.post('/bug-reports', {
        title,
        description,
        stepsToReproduce,
        expectedBehavior,
        actualBehavior,
        severity,
        application: selectedApp,
        environment,
        screenshots: uploadedImageUrls,
        consoleErrors: consoleErrors.trim() || undefined,
        queries: queries.trim() || undefined
      });

      // Limpiar borrador
      localStorage.removeItem('bugReportDraft');

      // Notificar éxito
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error al crear reporte:', error);
      setError(error.response?.data?.message || 'Error al crear el reporte. Por favor intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSelectedApp = (): Application | null => {
    return applications.find((app) => app._id === selectedApp) || null;
  };

  return (
    <div className="wizard-overlay" onClick={onClose}>
      <div className="wizard-container" onClick={(e) => e.stopPropagation()}>
        <div className="wizard-header">
          <h2 className="wizard-title">Nuevo Reporte de Bug</h2>
          <button
            type="button"
            onClick={onClose}
            className="wizard-close"
            disabled={isSubmitting}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="wizard-body">
          <StepIndicator steps={steps} currentStep={currentStep} />

          {error && (
            <div className="wizard-error">
              {error}
            </div>
          )}

          <div className="wizard-content">
            {currentStep === 0 && (
              <Step1BasicInfo
                selectedApp={selectedApp}
                title={title}
                applications={applications}
                onAppChange={setSelectedApp}
                onTitleChange={setTitle}
              />
            )}

            {currentStep === 1 && (
              <Step2Description
                description={description}
                stepsToReproduce={stepsToReproduce}
                onDescriptionChange={setDescription}
                onStepsChange={setStepsToReproduce}
              />
            )}

            {currentStep === 2 && (
              <Step3Behavior
                expectedBehavior={expectedBehavior}
                actualBehavior={actualBehavior}
                onExpectedChange={setExpectedBehavior}
                onActualChange={setActualBehavior}
              />
            )}

            {currentStep === 3 && (
              <Step4TechnicalErrors
                consoleErrors={consoleErrors}
                queries={queries}
                onConsoleErrorsChange={setConsoleErrors}
                onQueriesChange={setQueries}
              />
            )}

            {currentStep === 4 && (
              <Step5Evidence
                images={images}
                onImagesChange={setImages}
              />
            )}

            {currentStep === 5 && (
              <Step6Review
                severity={severity}
                environment={environment}
                onSeverityChange={setSeverity}
                onEnvironmentChange={setEnvironment}
                selectedApp={getSelectedApp()}
                title={title}
                description={description}
                stepsToReproduce={stepsToReproduce}
                expectedBehavior={expectedBehavior}
                actualBehavior={actualBehavior}
                consoleErrors={consoleErrors}
                queries={queries}
                images={images}
              />
            )}
          </div>
        </div>

        <div className="wizard-footer">
          <button
            type="button"
            onClick={handlePrevious}
            className="wizard-button wizard-button-secondary"
            disabled={currentStep === 0 || isSubmitting}
          >
            Anterior
          </button>

          <div className="wizard-footer-right">
            {currentStep < steps.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="wizard-button wizard-button-primary"
                disabled={isSubmitting}
              >
                Siguiente
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="wizard-button wizard-button-success"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner"></span>
                    Enviando...
                  </>
                ) : (
                  'Enviar Reporte'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BugReportWizard;
