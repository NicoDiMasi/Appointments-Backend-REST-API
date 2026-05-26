import mongoose from 'mongoose';
import { Paciente } from '../domain/Paciente.js';


const pacienteSchema = new mongoose.Schema({
    _id:{type:String,
         required: true,
         trim: true  
    },
    usuario:{
        type: Object,
        default: null
    },
    dni:{
        type: String,
        required: true,
        trim: true
    },
    nombre:{
        type: String,
        required: true,
        trim: true
    },
    obraSocial:{
        type: String,
        default: null,
        trim: true
    },
    plan:{
        type: String,
        default: null,
        trim: true
    },
    activo:{
        type: Boolean,
        default: true
    }
},{
    timestamps: true,
    versionKey: false,
    collection: 'pacientes'
})

//cargamos el schema de pacientes (MONGOOSE) -> a la entidad paciente (NUESTRO DOMINIO)
pacienteSchema.loadClass(Paciente);

//EXPORTAMOS EL MODELO MONGOOSE QUE SE USARA CORRESPONDIENTE AL ESQUEMA 
//EN NUESTRAS CAPAS DE REPOSITORIOS 
export const pacienteModel = mongoose.model('Paciente', pacienteSchema);