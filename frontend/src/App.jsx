import { useState, useEffect } from "react"


function App() {
  const [mostrarFormulario, setMostrarFormulario] = useState(false)


  const [dadosDevedor, setDadosDevedor] = useState({
    nome: '',
    cpf: '',
    telefone: '',
    email: ''
  })

  const [devedores, setDevedores] = useState([])

  const [editingId, setEditingId] = useState(null)

  const [mostrarDividas, setMostrarDividas] = useState(false)
  //const [devedorSelecionado, setDevedorSelecionado] = useState(null)
  const [dadosDivida, setDadosDivida] = useState({
    descricao: '',
    valor: '',
    dataVencimento: ''
  })
  const [carregandoDividas, setCarregandoDividas] = useState(false)
  const [relatorio, setRelatorio] = useState(null)
  const [dadosModalDividas, setDadosModalDividas] = useState(null)
  const [tela, setTela] = useState('principal')

  const [historico, setHistorico] = useState([])

  function handleChange(event) {
    const { name, value } = event.target

    setDadosDevedor({
      ...dadosDevedor,
      [name]: value
    })
  }
  async function handleSubmit(event) {
    event.preventDefault()
    try {
      if (editingId !== null) {
        // Lógica de edição (PUT) do devedor
        const resposta = await fetch(
          `http://localhost:3000/api/devedores/${editingId}`,
          {
            method: 'PUT',
            headers: { 'Content-type': 'application/json' },
            body: JSON.stringify(dadosDevedor)
          }
        )
        const resultado = await resposta.json()
        if (!resposta.ok) throw new Error(resultado.erro || 'Erro ao atualizar devedor.')

        await carregarDevedores()
        await carregarRelatorio()
        alert('Devedor atualizado com sucesso!')

      } else {
        // 1. PRIMEIRO: Cadastra o devedor na rota /api/devedores
        const respostaDevedor = await fetch('http://localhost:3000/api/devedores', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dadosDevedor)
        })

        const devedorCriado = await respostaDevedor.json()

        if (!respostaDevedor.ok) {
          throw new Error(devedorCriado.erro || 'Erro ao cadastrar devedor.')
        }

        // DECLARAÇÃO CORRETA DA VARIÁVEL FORA DA CONDIÇÃO
        const novoDevedorId = devedorCriado.id || devedorCriado.devedor?.id || devedorCriado.novoDevedor?.id

        if (!novoDevedorId) {
          throw new Error('Devedor cadastrado, mas a API não retornou o ID.')
        }

        // 2. SEGUNDO: Se preencheu os campos da dívida, cadastra na rota /api/dividas
        if (dadosDivida.descricao && dadosDivida.valor && dadosDivida.dataVencimento) {
          const corpoDivida = {
            devedorId: Number(novoDevedorId),
            descricao: String(dadosDivida.descricao),
            valor: parseFloat(dadosDivida.valor),
            dataVencimento: String(dadosDivida.dataVencimento)
          }

          const respostaDivida = await fetch('http://localhost:3000/api/dividas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(corpoDivida)
          })

          const resultadoDivida = await respostaDivida.json()

          if (!respostaDivida.ok) {
            throw new Error(resultadoDivida.erro || 'Devedor cadastrado, mas houve erro ao registrar a dívida.')
          }
        }

        await carregarDevedores()
        await carregarRelatorio()
        alert('Devedor e dívida cadastrados com sucesso!')
      }

      // Limpa os formulários e estados
      setDadosDevedor({ nome: '', cpf: '', telefone: '', email: '' })
      setDadosDivida({ descricao: '', valor: '', dataVencimento: '' })
      setEditingId(null)
      setMostrarFormulario(false)

    } catch (erro) {
      console.error('Erro no cadastro:', erro)
      alert(erro.message)
    }
  }
  async function handleDelete(id) {
    const confirmar = window.confirm(
      'Tem certeza que deseja excluir este devedor?'
    )
    if (!confirmar) {
      return
    }
    try {
      const resposta = await fetch(`http://localhost:3000/api/devedores/${id}`,
        { method: 'DELETE' }
      )
      if (!resposta.ok) {
        const resultado = await resposta.json()
        throw new Error(resultado.erro || 'Erro ao excluir devedor.')
      }
      //Buscar novamente os dados atualizados do banco
      await carregarDevedores()
      alert('Devedor excluido com sucesso!!')
    } catch (erro) {
      console.error('Erro ao excluir', erro)
      alert(erro.message)
    }

  }

  async function handleVerDividas(id) {
    try {
      setCarregandoDividas(true)
      setMostrarDividas(true)
      //setDadosDivida(null)
      setDadosModalDividas(null)

      const resposta = await fetch(
        `http://localhost:3000/api/devedores/${id}/dividas`
      )


      const resultado = await resposta.json()

      if (!resposta.ok) {
        throw new Error(resultado.erro || 'Erro ao consultar dívidas.')
      }
      //setDadosDivida(resultado)
      //setDevedorSelecionado(resultado.devedor)
      setDadosModalDividas(resultado)

    } catch (erro) {
      console.error('Erro ao consultar dívidas:', erro)
      alert(erro.message)
      setMostrarDividas(false)

    } finally {
      setCarregandoDividas(false)
    }

  }
  async function handleAtualizarStatus(id, novoStatus) {
    try {
      const resposta = await fetch(`http://localhost:3000/api/dividas/${id}/status`,
        {
          method: 'PATCH',
          headers: {
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            status: novoStatus
          })
        }
      )

      const resultado = await resposta.json()

      if (!resposta.ok) {
        throw new Error(resultado.erro || 'Erro ao atualizar status.')
      }
      //atualizar a lista de dividas do devedor
      await handleVerDividas(dadosModalDividas.devedor.id)

      //atualizar os indicadores do dashbord
      await carregarRelatorio()

      alert('Status atualizado com sucesso')
    } catch (erro) {
      console.error('Erro ao atualizar status', erro)
      alert(erro.message)
    }
  }

  function handleEdit(devedor) {
    setDadosDevedor({
      nome: devedor.nome,
      cpf: devedor.cpf,
      telefone: devedor.telefone,
      email: devedor.email
    })
    setEditingId(devedor.id)
    setMostrarFormulario(true)
  }
  async function carregarDevedores() {
    try {
      const resposta = await fetch('http://localhost:3000/api/devedores')

      const dados = await resposta.json()

      setDevedores(dados)
    } catch (erro) {
      console.log('erro ao buscar devedores', erro)
    }

  }

  async function carregarRelatorio() {
    try {
      const resposta = await fetch('http://localhost:3000/api/dividas/relatorio')

      const dados = await resposta.json()

      if (!resposta.ok) {
        throw new Error('Erro ao carregar relatório.')
      }

      setRelatorio(dados)

    } catch (erro) {
      console.error('Erro ao carregar relatório: ', erro)
    }

  }

  async function carregarHistorico() {
    try {
      const resposta = await fetch(
        'http://localhost:3000/api/dividas/historico'
      )
      if (!resposta.ok) {
        throw new Error('Erro ao carregar histórico')
      }
      const dados = await resposta.json()

      setHistorico(dados)
    } catch (erro) {
      console.error('Erro ao carregar histórico:', erro)
      alert(erro.message)
    }

  }
  useEffect(() => {
    carregarDevedores()
    carregarRelatorio()
  },
    [])

  return (
    <div className="container-fluid">
      {/*Menu superior */}
      <nav className="navbar navbar-dark bg-dark px-4">
        <span className="navbar-brand mb-0 h1">
          API Devedores
        </span>
        <button
          className="btn btn-outline-light"
          onClick={() => {
            carregarHistorico()
            setTela('historico')
          }}
        >
          <i className="bi bi-clock-history me-2"></i>
          Histórico de Pagamentos
        </button>
      </nav>

      {/*Conteudo principal */}
      <main className="container mt-4">
        {tela === 'principal' && (
          <>

            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h2>Painel Administrativo</h2>
                <p className="text-muted">
                  Gerenciamento de devedores e dívidas
                </p>
              </div>



              <button className="btn btn-primary" onClick={() => {
                setDadosDevedor({
                  nome: '',
                  cpf: '',
                  telefone: '',
                  email: ''
                })

                setEditingId(null)
                setMostrarFormulario(true)
              }}>
                + Novo Devedor
              </button>
              {mostrarFormulario && (
                <div className="card shadow-sm mt-3 mb-4">
                  <div className="card-header bg-white">
                    <h5 className="mb-0">{editingId !== null ? 'Editar devedor' : 'Cadastrar novo devedor'}
                    </h5>
                  </div>

                  <div className="card-body">
                    <form onSubmit={handleSubmit}>
                      <div className="mb-3">
                        <label className="form-label">Nome completo</label>
                        <input
                          type="text"
                          name="nome"
                          className="form-control"
                          placeholder="Digite o nome completo"
                          value={dadosDevedor.nome}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label">CPF</label>
                          <input
                            type="text"
                            name="cpf"
                            className="form-control"
                            placeholder="000.000.000-00"
                            value={dadosDevedor.cpf}
                            onChange={handleChange}
                          />
                        </div>

                        <div className="col-md-6 mb-3">
                          <label className="form-label">Telefone</label>
                          <input
                            type="text"
                            name="telefone"
                            className="form-control"
                            placeholder="(00) 00000-0000"
                            value={dadosDevedor.telefone}
                            onChange={handleChange}
                          />
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="form-label">E-mail</label>
                        <input
                          type="email"
                          name="email"
                          className="form-control"
                          placeholder="exemplo@email.com"
                          value={dadosDevedor.email}
                          onChange={handleChange}
                        />
                      </div>
                      <hr className="my-4" />

                      <h5 className="mb-3">Primeira dívida</h5>

                      <div className="mb-3">
                        <label className="form-label">Descrição da dívida</label>
                        <input
                          type="text"
                          className="form-control"
                          name="descricao"
                          value={dadosDivida.descricao}
                          onChange={(event) =>
                            setDadosDivida({
                              ...dadosDivida,
                              descricao: event.target.value
                            })
                          }
                          placeholder="Ex.: Empréstimo pessoal"
                        />
                      </div>

                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Valor (R$)</label>
                          <input
                            type="number"
                            className="form-control"
                            name="valor"
                            value={dadosDivida.valor}
                            onChange={(event) =>
                              setDadosDivida({
                                ...dadosDivida,
                                valor: event.target.value
                              })
                            }
                            min="0.01"
                            step="0.01"
                            placeholder="Ex.: 1500.50"
                          />
                        </div>

                        <div className="col-md-6 mb-3">
                          <label className="form-label">Data de vencimento</label>
                          <input
                            type="date"
                            className="form-control"
                            name="dataVencimento"
                            value={dadosDivida.dataVencimento}
                            onChange={(event) =>
                              setDadosDivida({
                                ...dadosDivida,
                                dataVencimento: event.target.value
                              })
                            }
                          />
                        </div>
                      </div>

                      <div className="d-flex gap-2">
                        <button type="submit" className="btn btn-success">
                          Salvar Devedor
                        </button>

                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => setMostrarFormulario(false)}
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>

            {/* Indicadores */}
            <div className="row mb-4">

              <div className="col-md-4 mb-3">
                <div className="card shadow-sm">
                  <div className="card-body">
                    <h6 className="text-muted">Total de Dividas</h6>
                    <h3>{relatorio ? relatorio.totalDividas : 0}</h3>
                  </div>
                </div>
              </div>

              <div className="col-md-4 mb-3">
                <div className="card shadow-sm">
                  <div className="card-body">
                    <h6 className="text-muted">Dívidas Pendentes</h6>
                    <h3>{relatorio ? relatorio.quantidadePendente : 0}</h3>
                  </div>
                </div>
              </div>
              <div className="col-md-4 mb-3">
                <div className="card shadow-sm">
                  <div className="card-body">
                    <h6 className="text-muted">Dividas Pagas</h6>
                    <h3>{relatorio ? relatorio.quantidadePaga : 0}</h3>
                  </div>
                </div>
              </div>
              <div className="col-md-4 mb-3">
                <div className="card shadow-sm">
                  <div className="card-body">
                    <h6 className="text-muted">Dividas Vencidas</h6>
                    <h3>{relatorio ? relatorio.quantidadeVencida : 0}</h3>
                  </div>
                </div>
              </div>

              <div className="col-md-4 mb-3">
                <div className="card shadow-sm">
                  <div className="card-body">
                    <h6 className="text-muted">Valor Total das Dívidas</h6>
                    <h3>{Number(relatorio?.valorTotal ?? 0).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    })}</h3>
                  </div>
                </div>
              </div>

            </div>

            {/* Tabela de devedores */}
            <div className="card shadow-sm">
              <div className="card-header bg-white">
                <h5 className="mb-0">Devedores cadastrados</h5>
              </div>

              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-striped table-hover">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Nome</th>
                        <th>CPF</th>
                        <th>E-mail</th>
                        <th>Ações</th>
                        <th>Dívidas</th>
                      </tr>
                    </thead>


                    <tbody>
                      {devedores.length === 0 ? (
                        <tr>
                          <td
                            colSpan='6' className="text-center text-muted">
                            Nenhum devedor encontrado.
                          </td>
                        </tr>
                      ) : (
                        devedores.map((devedor) => (
                          <tr key={devedor.id}>
                            <td>{devedor.id}</td>
                            <td>{devedor.nome}</td>
                            <td>{devedor.cpf}</td>
                            <td>{devedor.email}</td>
                            <td>
                              <button className="btn btn-sm btn-primary"
                                onClick={() => handleEdit(devedor)}>Editar</button>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleDelete(devedor.id)}
                              >
                                Excluir
                              </button>
                            </td>
                            <td>
                              <button
                                className="btn btn-sm btn-info text-white ms-1"
                                onClick={() => handleVerDividas(devedor.id)}>
                                Ver dívidas
                              </button>
                            </td>
                          </tr>
                        ))
                      )}

                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Janela de dívidas do devedor */}
            {mostrarDividas && (
              <div
                className="modal d-block"
                tabIndex="-1"
                style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
              >
                <div className="modal-dialog modal-lg modal-dialog-centered">
                  <div className="modal-content">

                    <div className="modal-header">
                      <h5 className="modal-title">
                        Dívidas do devedor
                      </h5>

                      <button
                        type="button"
                        className="btn-close"
                        onClick={() => setMostrarDividas(false)}
                      />
                    </div>

                    <div className="modal-body">

                      {carregandoDividas && (
                        <p className="text-center">
                          Carregando dívidas...
                        </p>
                      )}

                      {!carregandoDividas && dadosModalDividas && (
                        <>
                          <h5>{dadosModalDividas.devedor.nome}</h5>

                          <p className="text-muted">
                            CPF: {dadosModalDividas.devedor.cpf}
                          </p>

                          <div className="row mb-3">
                            <div className="col-md-6">
                              <strong>Quantidade de dívidas:</strong>
                              <h4>{dadosModalDividas.quantidadeDividas}</h4>
                            </div>

                            <div className="col-md-6">
                              <strong>Valor total:</strong>
                              <h4>
                                {Number(dadosModalDividas.valorTotal).toLocaleString(
                                  'pt-BR',
                                  { style: 'currency', currency: 'BRL' }
                                )}
                              </h4>
                            </div>
                          </div>

                          <div className="table-responsive">
                            <table className="table table-striped">
                              <thead>
                                <tr>
                                  <th>Descrição</th>
                                  <th>Vencimento</th>
                                  <th>Status</th>
                                  <th>Valor</th>
                                </tr>
                              </thead>

                              <tbody>
                                {dadosModalDividas.dividas.map((divida) => (
                                  <tr key={divida.id}>
                                    <td>{divida.descricao}</td>
                                    <td>
                                      {new Date(
                                        divida.dataVencimento
                                      ).toLocaleDateString('pt-BR', {
                                        timeZone: 'UTC'
                                      })}
                                    </td>
                                    <td><select
                                      className="form-select form-select-sm"
                                      value={divida.status}
                                      onChange={(event) =>
                                        handleAtualizarStatus(divida.id, event.target.value)
                                      }
                                    >
                                      <option value="PENDENTE">Pendente</option>
                                      <option value="PAGA">Paga</option>
                                      <option value="VENCIDA">Vencida</option>
                                    </select>
                                    </td>
                                    <td>
                                      {Number(divida.valor).toLocaleString(
                                        'pt-BR',
                                        { style: 'currency', currency: 'BRL' }
                                      )}
                                    </td>
                                  </tr>
                                ))}

                                {dadosModalDividas.dividas.length === 0 && (
                                  <tr>
                                    <td colSpan="4" className="text-center">
                                      Nenhuma dívida cadastrada.
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </>
                      )}

                    </div>

                    <div className="modal-footer">
                      <button
                        className="btn btn-secondary"
                        onClick={() => setMostrarDividas(false)}
                      >
                        Fechar
                      </button>
                    </div>

                  </div>
                </div>
              </div>
            )}
          </>
        )}
        {tela === 'historico' && (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h2>Histórico de Pagamentos</h2>
                <p className="text-muted">
                  Consulta de todas as dívidas quitadas
                </p>
              </div>

              <button
                className="btn btn-secondary"
                onClick={() => setTela('principal')}
              >
                Voltar
              </button>
            </div>

            <div className="card shadow-sm">
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead>
                      <tr>
                        <th>Devedor</th>
                        <th>CPF</th>
                        <th>Descrição</th>
                        <th>Valor</th>
                        <th>Vencimento</th>
                        <th>Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {historico.map((divida) => (
                        <tr key={divida.id}>
                          <td>{divida.devedor.nome}</td>
                          <td>{divida.devedor.cpf}</td>
                          <td>{divida.descricao}</td>
                          <td>
                            {Number(divida.valor).toLocaleString('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            })}
                          </td>
                          <td>
                            {new Date(divida.dataVencimento).toLocaleDateString(
                              'pt-BR',
                              { timeZone: 'UTC' }
                            )}
                          </td>
                          <td>
                            <span className="badge bg-success">
                              PAGA
                            </span>
                          </td>
                        </tr>
                      ))}

                      {historico.length === 0 && (
                        <tr>
                          <td colSpan="6" className="text-center text-muted py-4">
                            Nenhuma dívida paga encontrada.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

    </div>
  )
}

export default App
