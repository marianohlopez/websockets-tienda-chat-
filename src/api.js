import fs from 'fs'

class Contenedor {
    constructor(archivo) {
        this.archivo = archivo;
        this.productos = [];
    }

    //GUARDAR PRODUCTO NUEVO

    async save(title, price, thumbnail) {

        let newId

        const response = await this.getAll()

        if (response.length === 0) {
            newId = 1
        }
        else {
            newId = response[response.length - 1].id + 1
        }
        price = Number(price)
        const newObject = { title, price, thumbnail, id: newId };

        response.push(newObject);

        try {
            await fs.promises.writeFile(this.archivo, JSON.stringify(response, null, 2))
            //return newObject
        }
        catch (err) {
            throw new Error(`Error al guardar un nuevo objeto: ${err}`)
        }
    }

    //BUSCO Y REEMPLAZO UN PRODUCTO

    async replace(id, producto) {
        const response = await this.getAll()
        const oldProduct = response.findIndex(item => item.id === id)
        if (oldProduct === -1) {
            return { error: "producto no encontrado" }
        }
        response.splice(oldProduct, 1, { ...producto, id })
        try {
            await fs.promises.writeFile(this.archivo, JSON.stringify(response, null, 2))
        }
        catch (err) {
            throw new Error(`error: producto no encontrado`)
        }
    }

    //OBTENEMOS PRODUCTO BUSCADO MEDIANTE EL ID

    async getById(id) {

        try {
            const response = await this.getAll()
            return response.find(item => item.id === id) ?? { error: "producto no encontrado" };
        }
        catch (err) {
            throw new Error(`No se encuentra el producto: ${err}`)
        }
    }

    //OBTENGO TODOS LOS PRODUCTOS O UN ARRAY VACIO

    async getAll() {
        try {
            const response = await fs.promises.readFile(this.archivo, 'utf-8')
            return JSON.parse(response)
        }
        catch {
            return { error: "producto no encontrado" };
        }
    }

    async deleteById(id) {
        const response = await this.getAll();
        const newResponse = response.filter((item) => item.id !== id)
        if (newResponse.length === response.length) {
            return { error: "producto no encontrado" }
        }
        try {
            await fs.promises.writeFile(this.archivo, JSON.stringify(newResponse, null, 2))
            console.log('producto borrado');
        }
        catch (err) {
            throw new Error(`Error al borrar data: ${err}`)
        }
    }

    async deleteAll() {
        try {
            await fs.promises.writeFile(this.archivo, JSON.stringify([]))
        }
        catch (err) {
            throw new Error(`Error al escribir: ${err}`)
        }
    }
}

export default Contenedor







