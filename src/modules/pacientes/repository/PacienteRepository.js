
import { pacienteModel } from "../schemas/PacienteSchema.js";
import { Paciente } from "../domain/Paciente.js";

class PacienteRepository{
  constructor(){
    this.model = pacienteModel
  }

  toDomain(pacienteFromMongo) {
    return Paciente.create({
      id: pacienteFromMongo._id,
      dni: pacienteFromMongo.dni,
      nombre: pacienteFromMongo.nombre,
      usuario: pacienteFromMongo.usuario,
      obraSocial: pacienteFromMongo.obraSocial,
      plan: pacienteFromMongo.plan,
    });
  }

  async findAll(){
    const docs = await this.model.find({activo:true})
    return docs.map(doc => this.toDomain(doc))
  }

  async findById(id){
    const doc = await this.model.findById(id)
    return doc ? this.toDomain(doc) : null
  }


  async save(paciente){
    // mapeo el id de la entidad de dominio con el _id que espera mongo,
    // asi mantenemos nuestros propios ID y no el objeto raro que te devuelve mongo
    const nuevoPaciente = new this.model({ _id: paciente.id, ...paciente });
    const pacienteCreado = await nuevoPaciente.save()
    return this.toDomain(pacienteCreado)
  }



  // async deleteById(pacienteId) {
  //   return await this.model.findByIdAndDelete(pacienteId)
  // }

   async softDelete(pacienteId) {
    return this.toDomain(await this.model.findByIdAndUpdate(pacienteId, {activo:false}, {new:true}))
  }

  async updateById(pacienteId, datosActualizados){
    return this.toDomain(await this.model.findByIdAndUpdate(pacienteId, datosActualizados, {new:true}))
  }
}

export const pacienteRepository = new PacienteRepository();
export { PacienteRepository };