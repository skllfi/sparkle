import { exec, ExecException } from "child_process";

interface CommandResult {
  success: boolean;
  error?: string;
}

export function setProxy(
  address: string,
  port: number,
): Promise<CommandResult> {
  const command = `reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v ProxyEnable /t REG_DWORD /d 1 /f && reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v ProxyServer /t REG_SZ /d ${address}:${port} /f`;
  return new Promise((resolve) => {
    exec(command, (error: ExecException | null) => {
      if (error) {
        resolve({ success: false, error: error.message });
      } else {
        resolve({ success: true });
      }
    });
  });
}

export function disableProxy(): Promise<CommandResult> {
  const command = `reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v ProxyEnable /t REG_DWORD /d 0 /f`;
  return new Promise((resolve) => {
    exec(command, (error: ExecException | null) => {
      if (error) {
        resolve({ success: false, error: error.message });
      } else {
        resolve({ success: true });
      }
    });
  });
}

interface ProxyStatus {
  isEnabled: boolean;
  address?: string | null;
  port?: string | null;
}

export function getProxyStatus(): Promise<ProxyStatus> {
  return new Promise((resolve) => {
    exec(
      'reg query "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v ProxyEnable',
      (error: ExecException | null, stdout: string) => {
        if (error) {
          // Key might not exist, which means proxy is not enabled.
          return resolve({ isEnabled: false });
        }

        const isEnabled = stdout.includes("0x1");

        if (isEnabled) {
          exec(
            'reg query "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v ProxyServer',
            (err: ExecException | null, serverStdout: string) => {
              if (err) {
                // This case is unlikely if proxy is enabled, but handle it.
                return resolve({ isEnabled: true, address: null, port: null });
              }
              const match = serverStdout.match(
                /ProxyServer\s+REG_SZ\s+([^:]+):(\d+)/,
              );
              if (match) {
                resolve({ isEnabled: true, address: match[1], port: match[2] });
              } else {
                resolve({ isEnabled: true, address: null, port: null });
              }
            },
          );
        } else {
          resolve({ isEnabled: false });
        }
      },
    );
  });
}
