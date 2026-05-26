
import { pacienteModel } from "../schemas/PacienteSchema.js";
class PacienteRepository{
  constructor(){
    this.model = pacienteModel
  }

  async findAll() {
    return await this.model.find({});
  }

  async findById(id){
    return await this.model.findById(id)
  }


  async save(paciente){
    // mapeo el id de la entidad de dominio con el _id que espera mongo,
    // asi mantenemos nuestros propios ID y no el objeto raro que te devuelve mongo
    const nuevoPaciente = new this.model({ _id: paciente.id, ...paciente });
    const pacienteCreado = await nuevoPaciente.save()
    return pacienteCreado
  }



  async deleteById(pacienteId) {
    return await this.model.findByIdAndDelete(pacienteId)
  }

  async updateById(pacienteId, datosActualizados){
    return await this.model.findByIdAndUpdate(pacienteId, datosActualizados, {new:true})
  }
}

export const pacienteRepository = new PacienteRepository();
export { PacienteRepository };