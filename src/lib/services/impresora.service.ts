// @ts-ignore
import ReceiptPrinterEncoder from '@point-of-sale/receipt-printer-encoder';

export class ImpresoraService {
    private port: SerialPort | null = null;

    // 1. Conexión usando Web Serial (Sin conflictos con Windows)
    public async conectar(): Promise<boolean> {
        try {
            // Verifica si el navegador soporta Web Serial
            if (!navigator.serial) {
                alert("Tu navegador no soporta Web Serial API. Usa Chrome o Edge.");
                return false;
            }

            // Pide al usuario que seleccione el puerto de la impresora
            this.port = await navigator.serial.requestPort();

            // Abre la conexión. La mayoría de Xprinter usan 9600 o 115200 baudios.
            // Si imprime basura, cambia el baudRate a 115200.
            await this.port.open({ baudRate: 9600 });

            console.log("Impresora conectada por Puerto Serial");
            return true;

        } catch (error) {
            console.error("Fallo al conectar por Serial:", error);
            this.port = null;
            return false;
        }
    }

    // 2. Generar y enviar el ticket
    public async imprimirTicket(ultimaVenta: any, fmt: (n: number) => string, fmtDate: (d: string) => string): Promise<void> {
        // Si no hay puerto, pedimos conexión
        if (!this.port || !this.port.readable) {
            const exito = await this.conectar();
            if (!exito) return;
        }

        const encoder = new ReceiptPrinterEncoder({
            language: 'esc-pos',
            columns: 48
        });

        const itemsTicket = ultimaVenta.detalles.map((det: any) => {
            const cantidad = det.cantidad;
            const unidad = det.producto.unidad_medida.abreviatura;
            const nombre = det.producto.nombre_comercial.substring(0, 18);
            const subtotal = fmt(parseFloat(det.subtotal));
            return [`${cantidad} ${unidad} x ${nombre}`, subtotal];
        });

        const nombreCliente = ultimaVenta.cliente?.nombre
            ? `${ultimaVenta.cliente.nombre} ${ultimaVenta.cliente.apellido_paterno}`
            : 'Cliente Ocasional';

        let ticket = encoder
            .initialize()
            .align('center')
            .bold(true)
            .size(2, 2)
            .line('FERRETERÍA MILENIUM')
            .size(1, 1)
            .bold(false)
            .line('Sucursal Central')
            .newline()
            .align('left')
            .line(`N°: ${ultimaVenta.numero_comprobante}`)
            .line(`Fecha: ${fmtDate(ultimaVenta.createdAt)}`)
            .line(`Cliente: ${nombreCliente}`)
            .rule({ style: 'single' })
            .newline()
            .table(
                [
                    { width: 32, marginRight: 2, align: 'left' },
                    { width: 14, align: 'right' }
                ],
                itemsTicket
            )
            .newline()
            .rule({ style: 'single' })
            .align('right')
            .line(`Subtotal: ${fmt(parseFloat(ultimaVenta.subtotal))}`);

        const descuento = parseFloat(ultimaVenta.monto_descuento_global);
        if (descuento > 0) {
            ticket = ticket.line(`Descuento: -${fmt(descuento)}`);
        }

        ticket = ticket
            .rule({ style: 'single' })
            .bold(true)
            .size(2, 1)
            .line(`TOTAL: ${fmt(parseFloat(ultimaVenta.total))}`)
            .size(1, 1)
            .bold(false)
            .newline()
            .line(`Pagado (${ultimaVenta.metodo_pago}): ${fmt(parseFloat(ultimaVenta.monto_pagado))}`)
            .line(`Cambio: ${fmt(parseFloat(ultimaVenta.cambio_entregado))}`)
            .newline()
            .align('center')
            .bold(true)
            .line('¡Gracias por su compra!')
            .newline()
            .newline()
            .newline()
            .cut();

        try {
            const ticketBytes = ticket.encode();

            // Lógica de envío para Web Serial API
            const writer = this.port!.writable!.getWriter();
            await writer.write(ticketBytes);
            writer.releaseLock();

            console.log("¡Ticket impreso sin instalar dependencias de Windows!");

        } catch (error) {
            console.error("Error al enviar los datos:", error);
        }
    }
}

export const impresoraService = new ImpresoraService();