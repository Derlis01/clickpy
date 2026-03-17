#!/bin/bash
# Intenta crear una VM ARM A1 (Always Free) en Oracle Cloud.
# Usar con cron: cada hora hasta que haya capacidad.
#
# Agregar al crontab:
#   crontab -e
#   0 * * * * /path/to/oci-arm-retry.sh >> /tmp/oci-arm-retry.log 2>&1
#
# Cuando la VM se cree, desactivar el cron manualmente.

SSH_PUB=$(cat ~/.ssh/oci_clickpy.pub)

RESULT=$(oci compute instance launch \
  --compartment-id ocid1.tenancy.oc1..aaaaaaaaw3ktef4dteusqwgtlfnyhstlvnao7hooqualij5ntwadadq5yj4q \
  --availability-domain "Emdl:SA-SAOPAULO-1-AD-1" \
  --shape "VM.Standard.A1.Flex" \
  --shape-config '{"ocpus":4,"memoryInGBs":24}' \
  --image-id "ocid1.image.oc1.sa-saopaulo-1.aaaaaaaaxnifkyh62dquowtgdsesv2m5chkfgmyasfrlssr45ywl6dvd7ipq" \
  --subnet-id "ocid1.subnet.oc1.sa-saopaulo-1.aaaaaaaahwisnck5tqmc6y5gxjtbv4ytw23ql4ahaub4sowmdgexanecqg7a" \
  --assign-public-ip true \
  --display-name "clickpy-api-arm" \
  --metadata "{\"ssh_authorized_keys\": \"$SSH_PUB\"}" 2>&1)

TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

if echo "$RESULT" | grep -q "Out of host capacity"; then
  echo "[$TIMESTAMP] Sin capacidad ARM. Reintentando en la próxima hora..."
elif echo "$RESULT" | grep -q "PROVISIONING\|RUNNING"; then
  echo "[$TIMESTAMP] VM ARM CREADA! Desactivar el cron."
  echo "$RESULT"
else
  echo "[$TIMESTAMP] Error inesperado:"
  echo "$RESULT"
fi
