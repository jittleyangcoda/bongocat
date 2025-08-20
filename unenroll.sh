echo --enterprise-enable-unified-state-determination=never >/tmp/chrome_dev.conf
echo --enterprise-enable-forced-re-enrollment=never >>/tmp/chrome_dev.conf
echo --enterprise-enable-initial-enrollment=never >>/tmp/chrome_dev.conf
mount --bind /tmp/chrome_dev.conf /etc/chrome_dev.conf
initctl restart ui
