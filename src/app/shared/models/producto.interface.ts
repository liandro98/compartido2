import {} from "./rol.interface"
export interface Producto {
    cveProducto?: number;
    descripcion?: string;
    precio?:number;
    cantidad: number;
    cveCategoria: number;
}
