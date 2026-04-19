import { initDb, registerLifecycleHandlers } from './db';
import { connectDrive, downloadDbFromDrive, uploadDbToDrive, runDailyArchive, isDriveConnected, getDriveClientId } from './driveSync';
import { settingsRepo } from './repos';

export async function bootstrapStorage(opts: { onStatus?: (msg: string) => void } = {}): Promise<void> {
  const { onStatus } = opts;
  onStatus?.('Lokale Datenbank wird initialisiert …');
  await initDb();
  registerLifecycleHandlers();
  if (getDriveClientId()) {
    try {
      onStatus?.('Verbindung zu Google Drive wird wiederhergestellt …');
      await connectDrive(false);
      onStatus?.('Lade Sicherung von Google Drive …');
      const loaded = await downloadDbFromDrive();
      if (!loaded) await uploadDbToDrive();
      onStatus?.('Tages-Archivierung …');
      await runDailyArchive();
      onStatus?.('Synchronisation abgeschlossen.');
    } catch (e) {
      console.warn('Drive-Sync beim Start fehlgeschlagen:', e);
      onStatus?.('Drive-Sync fehlgeschlagen, App läuft offline.');
    }
  } else {
    onStatus?.('Keine Google Drive Verknüpfung aktiv (App läuft rein lokal).');
  }

  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && isDriveConnected()) {
      void uploadDbToDrive().catch((e) => console.warn('Upload bei Hide fehlgeschlagen:', e));
    }
  });
}

export function lastSyncInfo() {
  return {
    clientIdConfigured: !!getDriveClientId(),
    lastUploadAt: settingsRepo.get('drive.lastUploadAt'),
    lastDownloadAt: settingsRepo.get('drive.lastDownloadAt'),
    lastArchiveDate: settingsRepo.get('drive.lastArchiveDate'),
    connected: isDriveConnected()
  };
}
