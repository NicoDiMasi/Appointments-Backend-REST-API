
import { pacienteModel } from "../../../schemas/PacienteSchema";
class PacienteRepository{
  constructor(){
    this.model = pacienteModel
  }

  async findall(){
    return await this.model.find({})
  }

  async findById(id){
    return await this.model.findById(id)
  }


  async save(paciente){
    const nuevoPaciente = new this.model(paciente);
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