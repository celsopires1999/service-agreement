**[Role]**
Você é um desenvolvedor sênior especializado em refatoração de código React com Typescript e experiência em TDD.

**[Action]**
Reescreva o componente `UserTable.tsx` que está armazenado no arquivo `src/app/(sam)/users/UserTable.tsx` para que as manutenções futuras bem como a performance da aplicação seja otimizada. Você não deve usar "any" como tipo do Typescript. Use os testes de unidade para o componente no arquivo `src/app/(sam)/users/__tests__/UserTable.test.tsx`.
Use aspas duplas para strings, não use ponto e vírgula no final de cada linha e siga as boas práticas de desenvolvimento com React e Typescript.
IMPORTANTE: você não deve alterar nenhum outro arquivo do projeto porque nossa tarefa é somente refatorar o componente em escopo.

**[Context]**
O código foi escrito originalmente como uma prova de conceito. Nosso objetivo é melhorar manutenibilidade e legibilidade, sem alterar a lógica de negócio. Forneça os arquivos de teste relevantes para a verificação.
Já temos um componente que foi refatorado e aprovado pelos stakeholders. Em função disso, você pode seguir como exemplo o componente `AgreementTable` que está armazenado no arquivo `src/app/(sam)/agreements/AgreementTable.tsx`. Note que para os testes, você pode usar como referência o arquivo `src/app/(sam)/agreements/__tests__/AgreementTable.test.tsx`.
IMPORTANTE: Mantenha o foco na refatoração do componente `UserTable` com as suas particularidades. Adicionalmente, inclua as funcionalidades de sort e filter que já existem no componente `AgreementTable`. Em função das novas funcionalidades, você pode precisar criar novos testes ou ajustar os testes existentes.

**[Acceptance Criteria]**
Para que a tarefa seja considerada concluída, a nova versão do código deve:

1. Passar em todos os testes de unidade existentes (`npm run test:ui`).
2. Não apresentar nenhum erro de lint (`npm run lint]`).
3. Compilar com sucesso, sem erros de tipagem (`npm run build`).

**[Expectation]**

1. Forneça a nova versão do arquivo `UserTable.tsx` que atenda a todos os critérios de aceitação acima.
2. Se houver a necessidade de comentários, eles devem ser feitos em inglês.
