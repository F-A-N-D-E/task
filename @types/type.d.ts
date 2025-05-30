type Date = `${number}${number}${number}${number}-${number}${number}-${number}${number}`

export type TypeElemAppeal = {
    id: number,
    status: 'new'|'process'|'reject'|'completed',
    title: string,
    message_appeal: string,
    respon?: string,
    date_create: Date
}

export type TypeQueryGetForDate = {
    date?: Date
}

export type TypeQueryGetBetweenDate = {
    from?: Date,
    to?: Date
}

export type TypeElemQueryCreate = {
    title: string,
    message_appeal: string,
    date: Date
}