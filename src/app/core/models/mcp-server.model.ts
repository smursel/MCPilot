/**
 * Kullanıcının tanımladığı sunucu kaydı — kalıcıdır, ayarlardan düzenlenir.
 * Bağlantının anlık durumunu bilinçli olarak taşımaz; bkz. `McpServerConnection`.
 */
export interface McpServerConfig {
  readonly id: string;
  readonly name: string;
  readonly url: string;
  readonly enabled: boolean;
  /** ISO 8601 */
  readonly createdAt: string;
}

export type McpConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

/**
 * Bağlantının çalışma anındaki durumu. Kalıcı değildir, store'da yaşar.
 * Config'ten ayrı tutuluyor ki kullanıcı ayarı ile runtime durumu karışmasın.
 */
export interface McpServerConnection {
  readonly serverId: string;
  readonly status: McpConnectionStatus;
  /** Yalnızca `status === 'error'` iken dolu olur. */
  readonly error?: string;
  /** ISO 8601 — son başarılı bağlantı. */
  readonly connectedAt?: string;
}
