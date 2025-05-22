import { DataTypes, Sequelize } from "sequelize";
import { conf } from "./conf.js";

export const sequelize = new Sequelize(conf.DB_NAME, conf.DB_USERNAME, conf.DB_PASSWORD, {
  host: conf.HOST,
  dialect: "mysql",
  define: {
    freezeTableName: true,
    timestamps: false
  },
})

export const Appeal = sequelize.define( 'Appeal', // свойста таблицы
  {
    status: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    message_appeal: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    respon: {
        type: DataTypes.STRING,
    }, 
    date_create: {
        type: DataTypes.DATEONLY,
        allowNull: false
    }
  }
);

export async function setRecords () {
  await Appeal.create({ // записи, присутствующие в таблице 
    status: 'new',
    title: 'Заголовок обращения 1',
    message_appeal: 'Текст обращения 1',
    respon: '',
    date_create: '2025-01-01'
  })
  await Appeal.create({
    status: 'new',
    title: 'Заголовок обращения 2',
    message_appeal: 'Текст обращения 2',
    respon: '',
    date_create: '2025-02-02'
  })
  await Appeal.create({
    status: 'new',
    title: 'Заголовок обращения 3',
    message_appeal: 'Текст обращения 3',
    respon: '',
    date_create: '2025-03-03'
  })
  await Appeal.create({
    status: 'new',
    title: 'Заголовок обращения 4',
    message_appeal: 'Текст обращения 4',
    respon: '',
    date_create: '2025-04-04'
  })
  await Appeal.create({
    status: 'new',
    title: 'Заголовок обращения 5',
    message_appeal: 'Текст обращения 5',
    respon: '',
    date_create: '2025-05-05'
  })
}


