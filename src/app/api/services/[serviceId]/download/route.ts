import { getSession } from "@/lib/auth"
import { getServiceWithRelations } from "@/lib/queries/service"
import { getUserListItemsByServiceId } from "@/lib/queries/userList"
import { type NextRequest } from "next/server"
import { utils, write } from "xlsx"

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ serviceId: string }> },
) {
    const serviceId = (await params).serviceId

    try {
        await getSession()
        const service = await getServiceWithRelations(serviceId)
        if (service.length === 0) {
            return writeExcelFile(
                [
                    {
                        error: "service not found",
                    },
                ],
                "service not found",
                "ERROR",
            )
        }

        const userListItems = await getUserListItemsByServiceId(serviceId)
        if (userListItems.length === 0) {
            return writeExcelFile(
                [
                    {
                        error: "user list not found",
                    },
                ],
                "user list not found",
                "ERROR",
            )
        }

        const formattedData = userListItems.map((item) => {
            return {
                "Número do Contrato": service[0].agreementCode,
                "Centro de Custo": item.costCenter,
                Área: item.area,
                "Sistema/Serviço": service[0].serviceName,
                Critério: "Usuários",
                Nome: item.name,
                "E-mail": item.email,
            }
        })
        return writeExcelFile(
            formattedData,
            service[0].serviceName,
            service[0].localPlan,
        )
    } catch (error) {
        if (error instanceof Error) {
            return writeExcelFile(
                [
                    {
                        error: error.message,
                    },
                ],
                "something went wrong",
                "ERROR",
            )
        }
        return writeExcelFile(
            [
                {
                    error: "something went wrong",
                },
            ],
            "something went wrong",
            "ERROR",
        )
    }
}

function writeExcelFile(data: unknown[], service: string, localPlan: string) {
    const worksheet = utils.json_to_sheet(data)

    const workbook = utils.book_new()

    utils.book_append_sheet(workbook, worksheet, localPlan)

    const buf = write(workbook, { type: "buffer", bookType: "xlsx" })

    const filename = service.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 50)

    return new Response(buf, {
        status: 200,
        headers: {
            "Content-Disposition": `attachment; filename="${filename}.xlsx"`,
            "Content-Type": "application/vnd.ms-excel",
        },
    })
}
