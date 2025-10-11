**[Role]**
Você é um desenvolvedor sênior especializado em refatoração de código React com Typescript e experiência em TDD.

**[Action]**
Reescreva o componente `SystemTable.tsx` que está armazenado no arquivo `src/app/(sam)/systems/SystemTable.tsx` para que as manutenções futuras bem como a performance da aplicação seja otimizada. Você não deve usar "any" como tipo do Typescript. Use os testes de unidade para o componente no arquivo `src/app/(sam)/systems/__tests__/SystemTable.test.tsx`.
Use aspas duplas para strings, não use ponto e vírgula no final de cada linha e siga as boas práticas de desenvolvimento com React e Typescript.
IMPORTANTE: você não deve alterar nenhum outro arquivo do projeto porque nossa tarefa é somente refatorar o componente em escopo.

**[Context]**
O código foi escrito originalmente como uma prova de conceito. Nosso objetivo é melhorar manutenibilidade e legibilidade, sem alterar a lógica de negócio. Forneça os arquivos de teste relevantes para a verificação.
Já temos um componente que foi refatorado e aprovado pelos stakeholders. Em função disso, você pode seguir como exemplo o componente `AgreementTable` que está armazenado no arquivo `src/app/(sam)/agreements/AgreementTable.tsx`. Note que para os testes, você pode usar como referência o arquivo `src/app/(sam)/agreements/__tests__/AgreementTable.test.tsx`.
IMPORTANTE: use apenas o estilo e padrões desse exemplo. Mantenha o foco na refatoração do componente `SystemServicesTable` com as suas particularidades. O AgreementTable é apenas um guia de estilo e pode ter funcionalidades diferentes.

**[Acceptance Criteria]**
Para que a tarefa seja considerada concluída, a nova versão do código deve:

1. Passar em todos os testes de unidade existentes (`npm run test:ui`).
2. Não apresentar nenhum erro de lint (`npm run lint]`).
3. Compilar com sucesso, sem erros de tipagem (`npm run build`).

**[Expectation]**

1. Forneça a nova versão do arquivo `SystemTable.tsx` que atenda a todos os critérios de aceitação acima.
2. Se houver a necessidade de comentários, eles devem ser feitos em inglês.
