# 🚀 Prototipo "Ventanilla Digital" - Guía de Instalación

## 📋 Requisitos Previos

- Node.js 20+ LTS
- npm, yarn, pnpm o bun
- Cuenta de Firebase con proyecto creado
- Credenciales de Firebase configuradas

## 🔧 Instalación

### 1. Instalar Dependencias

```bash
cd frontend
npm install
# o
pnpm install
# o
yarn install
```

### 2. Configurar Variables de Entorno

Crea un archivo `.env.local` en la carpeta `frontend/` con las siguientes variables:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=transporte-fluvial
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=transporte-fluvial.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id
```

**Cómo obtener estas credenciales:**
1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Selecciona tu proyecto (o crea uno nuevo)
3. Ve a Project Settings > General
4. En "Your apps", selecciona la app web o crea una nueva
5. Copia las credenciales al archivo `.env.local`

### 3. Configurar Firestore

Asegúrate de que las reglas de Firestore estén desplegadas:

```bash
cd backend/firebase
firebase deploy --only firestore:rules
```

### 4. Crear Datos de Prueba (Seed Data)

Ejecuta el script de seed data para crear:
- 1 Ruta: Atalaya → Pucallpa
- 1 Embarcación: "Rápido Ucayali" (80 asientos)
- 2 Viajes programados para mañana
- 160 asientos totales (80 por viaje)

**Opción 1: Usando Firebase Admin SDK (recomendado)**

```bash
cd backend/scripts
# Asegúrate de tener serviceAccountKey.json en ../firebase/
node seed-prototipo.js
# O usando npm script:
npm run seed-prototipo
```

**Opción 2: Usando Firebase Client SDK (desde frontend)**

```bash
cd frontend
# Configura las variables de entorno primero
node ../backend/firebase/seed-data-standalone.js
```

**Opción 3: Manualmente desde Firebase Console**

Puedes crear los datos manualmente siguiendo el esquema en `backend/docs/FIRESTORE-SCHEMA.md`

## 🚀 Ejecutar el Prototipo

```bash
cd frontend
npm run dev
```

El prototipo estará disponible en: `http://localhost:3000`

La aplicación redirigirá automáticamente a `/dashboard`

## 📱 Uso del Prototipo

### Dashboard
- Muestra los viajes programados para hoy y mañana
- Cada tarjeta muestra la ocupación del viaje
- Haz clic en "Gestionar Ventas" para abrir la ventanilla

### Ventanilla de Ventas
1. **Mapa de Asientos**: Visualiza todos los asientos del barco
   - Verde: Disponible
   - Amarillo: Seleccionado
   - Rojo: Vendido

2. **Registrar Venta**:
   - Haz clic en un asiento disponible (verde)
   - Completa el formulario (DNI, Nombre, Teléfono, Monto, Método de pago)
   - Confirma la venta
   - El asiento se actualizará en tiempo real

3. **Cuadre de Caja**:
   - Muestra el total recaudado en tiempo real
   - Desglose por método de pago (Efectivo, YAPE, PLIN)
   - Campo para comparar con dinero físico contado

4. **Generar Manifiesto**:
   - Haz clic en "Imprimir Manifiesto"
   - Se descargará un PDF con la lista completa de pasajeros
   - Formato estándar para presentar a la Marina/Capitanía

## 🔒 Seguridad

Para el prototipo, las reglas de Firestore permiten lectura/escritura a usuarios autenticados. En producción, deberías:

1. Implementar autenticación real con Firebase Auth
2. Restringir permisos por roles (ADMIN, VENDEDOR)
3. Validar datos en el servidor (usando Cloud Functions)

## 🐛 Solución de Problemas

### Error: "Firebase: No Firebase App '[DEFAULT]' has been created"
- Verifica que las variables de entorno estén correctamente configuradas
- Asegúrate de que el archivo `.env.local` esté en la carpeta `frontend/`

### Error: "Permission denied" en Firestore
- Verifica que las reglas de Firestore estén desplegadas
- Asegúrate de estar autenticado (para el prototipo, las reglas permiten acceso autenticado)

### No aparecen viajes en el dashboard
- Ejecuta el script de seed data
- Verifica que los viajes tengan `status: 'scheduled'`
- Verifica que las fechas sean de hoy o mañana

### El mapa de asientos no se actualiza
- Verifica la conexión a Firebase
- Revisa la consola del navegador para errores
- Asegúrate de que los asientos estén en la subcolección `trips/{tripId}/seats`

## 📚 Estructura del Proyecto

```
frontend/
├── app/
│   ├── (admin)/              # Layout protegido
│   │   ├── layout.tsx        # Sidebar admin
│   │   ├── dashboard/        # Lista de viajes
│   │   └── ventas/[tripId]/  # Ventanilla de ventas
│   └── layout.tsx           # Layout raíz
├── components/
│   ├── admin/                # Componentes específicos del admin
│   │   ├── TripCard.tsx
│   │   ├── SeatMap.tsx       # ⭐ Componente estrella
│   │   ├── QuickSaleModal.tsx
│   │   ├── CashSummaryCard.tsx
│   │   └── ManifestButton.tsx
│   └── ui/                   # Componentes Shadcn/ui
├── lib/
│   ├── firebase.ts           # Configuración Firebase
│   ├── firestore-helpers.ts  # Funciones helper Firestore
│   ├── pdf-generator.ts      # Generación de PDFs
│   └── utils.ts              # Utilidades (cn)
└── .env.local                # Variables de entorno (NO commitear)
```

## 🎯 Próximos Pasos

1. **Autenticación**: Implementar login real con Firebase Auth
2. **Validaciones**: Agregar validación de DNI con RENIEC (simulada)
3. **Reportes**: Agregar más reportes y estadísticas
4. **Offline**: Implementar soporte offline para ventas
5. **Notificaciones**: Alertas cuando se vende un asiento

## 📝 Notas

- Este es un **prototipo funcional**, no la versión final de producción
- Los datos se almacenan directamente en Firestore desde el frontend
- No hay backend intermedio para acelerar el desarrollo del prototipo
- El sistema está diseñado para ser usado en tablet/laptop en el punto de venta

---

**Desarrollado para:** Sistema de Transporte Fluvial Atalaya  
**Fecha:** Diciembre 2025  
**Versión:** 1.0 - Prototipo
