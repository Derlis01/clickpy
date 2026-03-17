# Oracle Cloud Infrastructure — ClickPy

## Cuenta

| Campo | Valor |
|-------|-------|
| Tenant | derliscuba |
| Tenancy OCID | `ocid1.tenancy.oc1..aaaaaaaaw3ktef4dteusqwgtlfnyhstlvnao7hooqualij5ntwadadq5yj4q` |
| User OCID | `ocid1.user.oc1..aaaaaaaa6jsvjeejrqhet6pskw3nn35rt62mw7jklzb6t727fbea3idv22jq` |
| Home Region | sa-saopaulo-1 (São Paulo) |
| Tipo de cuenta | Free Tier (Always Free) |

## CLI

Config en `~/.oci/config`. API key en `~/.oci/oci_api_key.pem`.

```bash
# Verificar conexión
oci iam availability-domain list
```

## Servidor: clickpy-api

| Campo | Valor |
|-------|-------|
| Instance OCID | `ocid1.instance.oc1.sa-saopaulo-1.antxeljrbrq3okqcp2dirbscmh22mtdxal4eplplq763sn6okvqrbh4xpsja` |
| Shape | VM.Standard.E2.1.Micro (Always Free) |
| IP Pública | 147.15.80.215 |
| IP Privada | 10.0.0.100 |
| OS | Ubuntu 22.04 Minimal |
| CPU | 2 vCPUs (AMD EPYC 7551) |
| RAM | 1 GB |
| Disco | 47 GB |
| Costo | $0 (free-tier-retained: true) |

```bash
# Conectar
ssh -i ~/.ssh/oci_clickpy ubuntu@147.15.80.215
```

## Red

| Recurso | OCID |
|---------|------|
| VCN (clickpy-vcn) | `ocid1.vcn.oc1.sa-saopaulo-1.amaaaaaabrq3okqabx5gnc6bmjqgrh4bawnw2vmthkmy6ievqam6houmd45q` |
| Subnet (clickpy-public-subnet) | `ocid1.subnet.oc1.sa-saopaulo-1.aaaaaaaahwisnck5tqmc6y5gxjtbv4ytw23ql4ahaub4sowmdgexanecqg7a` |
| Internet Gateway (clickpy-igw) | `ocid1.internetgateway.oc1.sa-saopaulo-1.aaaaaaaachsdat7jvrj72hsfrhoi7silnwjmxqjdxrq7adzwc7fg6cf7tx7q` |
| Route Table | `ocid1.routetable.oc1.sa-saopaulo-1.aaaaaaaazg2d5xlzulvc5vr3z5tz6pdghsosodpr2uj4qhzs3zftgm5jbmfq` |
| Security List | `ocid1.securitylist.oc1.sa-saopaulo-1.aaaaaaaaof2sew3q3yq5l64ikpflmagxeksg36i6xgryjxeh5q45xkwlp4xa` |

### Puertos abiertos (Security List)

- 22 (SSH)
- 80 (HTTP)
- 443 (HTTPS)

## SSH Key

- Privada: `~/.ssh/oci_clickpy`
- Pública: `~/.ssh/oci_clickpy.pub`

## Imágenes disponibles (ARM - para upgrade futuro)

| Imagen | OCID |
|--------|------|
| Ubuntu 24.04 ARM | `ocid1.image.oc1.sa-saopaulo-1.aaaaaaaaxnifkyh62dquowtgdsesv2m5chkfgmyasfrlssr45ywl6dvd7ipq` |

### Comando para crear VM ARM A1 (cuando haya capacidad)

```bash
SSH_PUB=$(cat ~/.ssh/oci_clickpy.pub)
oci compute instance launch \
  --compartment-id ocid1.tenancy.oc1..aaaaaaaaw3ktef4dteusqwgtlfnyhstlvnao7hooqualij5ntwadadq5yj4q \
  --availability-domain "Emdl:SA-SAOPAULO-1-AD-1" \
  --shape "VM.Standard.A1.Flex" \
  --shape-config '{"ocpus":4,"memoryInGBs":24}' \
  --image-id "ocid1.image.oc1.sa-saopaulo-1.aaaaaaaaxnifkyh62dquowtgdsesv2m5chkfgmyasfrlssr45ywl6dvd7ipq" \
  --subnet-id "ocid1.subnet.oc1.sa-saopaulo-1.aaaaaaaahwisnck5tqmc6y5gxjtbv4ytw23ql4ahaub4sowmdgexanecqg7a" \
  --assign-public-ip true \
  --display-name "clickpy-api-arm" \
  --metadata "{\"ssh_authorized_keys\": \"$SSH_PUB\"}" \
  --wait-for-state RUNNING
```

## DNS (pendiente)

Apuntar `api.clickpy.app` → 147.15.80.215 (registro A en Cloudflare, proxy activado para SSL gratis).
