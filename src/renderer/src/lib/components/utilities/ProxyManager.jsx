import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import Card from '@/components/ui/card.jsx';
import Button from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';

export default function ProxyManager() {
    const { t } = useTranslation();
    const [isEnabled, setIsEnabled] = useState(false);
    const [address, setAddress] = useState('127.0.0.1');
    const [port, setPort] = useState('8080');
    const [isLoading, setIsLoading] = useState(true);

    const fetchProxyStatus = useCallback(async () => {
        try {
            const status = await window.api.getProxyStatus();
            setIsEnabled(status.isEnabled);
            if (status.address && status.port) {
                setAddress(status.address);
                setPort(status.port);
            }
        } catch (error) {
            toast.error(t('utilities.proxy_status_error'));
        }
        setIsLoading(false);
    }, [t]);

    useEffect(() => {
        fetchProxyStatus();

        const unsubscribe = window.api.onProxyStatusChanged(() => {
            fetchProxyStatus();
        });

        return () => {
            unsubscribe();
        };
    }, [fetchProxyStatus]);

    const handleEnableProxy = async () => {
        if (!/^[\d\.]+$/.test(address)) {
            toast.error(t('utilities.proxy_invalid_address'));
            return;
        }
        if (!/^\d+$/.test(port) || parseInt(port) < 1 || parseInt(port) > 65535) {
            toast.error(t('utilities.proxy_invalid_port'));
            return;
        }

        const result = await window.api.setProxy(address, port);
        if (result.success) {
            setIsEnabled(true);
            toast.success(t('utilities.proxy_enabled_success'));
        } else {
            toast.error(`${t('utilities.proxy_enable_error')}: ${result.error}`);
        }
    };

    const handleDisableProxy = async () => {
        const result = await window.api.disableProxy();
        if (result.success) {
            setIsEnabled(false);
            toast.info(t('utilities.proxy_disabled_success'));
        } else {
            toast.error(`${t('utilities.proxy_disable_error')}: ${result.error}`);
        }
    };

    if (isLoading) {
        return null; // Or a loading spinner
    }

    return (
        <Card>
            <div className="flex flex-col h-full">
                <h3 className="text-lg font-semibold">{t('utilities.proxy_title')}</h3>
                <p className="text-sm text-gray-400 mb-4">
                    {t('utilities.proxy_description')}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-4 items-center">
                    <div>
                        <div className="text-sm text-gray-400">{t("utilities.proxy_status_label")}</div>
                        <div className={`font-semibold ${isEnabled ? 'text-green-400' : 'text-red-400'}`}>
                            {isEnabled ? t("utilities.proxy_status_active") : t("utilities.proxy_status_inactive")}
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                       <Input
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder={t('utilities.proxy_address_placeholder')}
                            className="w-3/4"
                        />
                        <span className="text-xl">:</span>
                        <Input
                            type="text"
                            value={port}
                            onChange={(e) => setPort(e.target.value)}
                            placeholder={t('utilities.proxy_port_placeholder')}
                            className="w-1/4"
                        />
                    </div>
                </div>

                <div className="flex-grow"></div>

                <div className="flex space-x-2">
                    <Button onClick={handleEnableProxy} disabled={isEnabled} className="flex-1">
                        {t('utilities.proxy_enable_button')}
                    </Button>
                    <Button onClick={handleDisableProxy} disabled={!isEnabled} variant="destructive" className="flex-1">
                        {t('utilities.proxy_disable_button')}
                    </Button>
                </div>
            </div>
        </Card>
    );
}