/**
 * Bir MCP sunucusunun sunduğu tool. Kimliği `serverId` + `name` bileşimidir;
 * `name` yalnızca kendi sunucusu içinde tekildir.
 */
export interface McpTool {
  readonly serverId: string;
  readonly name: string;
  /** İnsan-okunur ad; yoksa `name` gösterilir. */
  readonly title?: string;
  readonly description?: string;
  /** Tool'un beklediği argümanları tarif eden JSON Schema. Kullanmadan önce daraltılmalı. */
  readonly inputSchema: unknown;
}
