export interface BugTemplate {
  id: string
  name: string
  description: string
  icon: string
  defaults: {
    severity?: string
    description?: string
    stepsToReproduce?: string
    expectedBehavior?: string
    actualBehavior?: string
  }
}

export const bugTemplates: BugTemplate[] = [
  {
    id: 'ui-visual',
    name: 'Error Visual/UI',
    description: 'Problemas con la interfaz de usuario, estilos o layout',
    icon: 'Layout',
    defaults: {
      severity: 'low',
      description: 'El elemento visual no se muestra correctamente...',
      stepsToReproduce: '1. Navegar a la página\n2. Observar el elemento\n3. El problema visual es visible',
      expectedBehavior: 'El elemento debería mostrarse correctamente según el diseño',
      actualBehavior: 'El elemento se muestra con errores visuales',
    },
  },
  {
    id: 'functionality',
    name: 'Error Funcional',
    description: 'Una funcionalidad no trabaja como se espera',
    icon: 'Cog',
    defaults: {
      severity: 'medium',
      description: 'La funcionalidad no responde correctamente...',
      stepsToReproduce: '1. Realizar la acción\n2. Observar el resultado\n3. El comportamiento es incorrecto',
      expectedBehavior: 'La funcionalidad debería completar la acción correctamente',
      actualBehavior: 'La funcionalidad no completa la acción o da un resultado incorrecto',
    },
  },
  {
    id: 'crash',
    name: 'Crash/Error Crítico',
    description: 'La aplicación se detiene o deja de responder',
    icon: 'AlertTriangle',
    defaults: {
      severity: 'critical',
      description: 'La aplicación crashea o deja de responder...',
      stepsToReproduce: '1. Realizar la acción específica\n2. La aplicación se congela/crashea',
      expectedBehavior: 'La aplicación debería continuar funcionando normalmente',
      actualBehavior: 'La aplicación se detiene, crashea o muestra pantalla de error',
    },
  },
  {
    id: 'performance',
    name: 'Problema de Rendimiento',
    description: 'La aplicación es lenta o consume muchos recursos',
    icon: 'Gauge',
    defaults: {
      severity: 'medium',
      description: 'La aplicación presenta problemas de rendimiento...',
      stepsToReproduce: '1. Realizar la acción\n2. Notar la lentitud o alto consumo de recursos',
      expectedBehavior: 'La acción debería completarse en un tiempo razonable',
      actualBehavior: 'La acción tarda demasiado o el sistema se vuelve lento',
    },
  },
  {
    id: 'data',
    name: 'Error de Datos',
    description: 'Datos incorrectos, pérdida de datos o inconsistencias',
    icon: 'Database',
    defaults: {
      severity: 'high',
      description: 'Los datos no se guardan/muestran correctamente...',
      stepsToReproduce: '1. Ingresar/modificar datos\n2. Guardar\n3. Verificar los datos almacenados',
      expectedBehavior: 'Los datos deberían guardarse y mostrarse correctamente',
      actualBehavior: 'Los datos se pierden, duplican o muestran incorrectamente',
    },
  },
  {
    id: 'security',
    name: 'Problema de Seguridad',
    description: 'Vulnerabilidad o acceso no autorizado',
    icon: 'Shield',
    defaults: {
      severity: 'critical',
      description: 'Se detectó un problema de seguridad...',
      stepsToReproduce: '1. [Describir pasos cuidadosamente]\n2. [No compartir información sensible]',
      expectedBehavior: 'El sistema debería proteger los datos y accesos',
      actualBehavior: 'Se puede acceder a información/funciones no autorizadas',
    },
  },
  {
    id: 'blank',
    name: 'Reporte en Blanco',
    description: 'Empezar desde cero sin plantilla',
    icon: 'FileText',
    defaults: {},
  },
]

export function getTemplateById(id: string): BugTemplate | undefined {
  return bugTemplates.find((t) => t.id === id)
}

export default bugTemplates
