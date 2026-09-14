import {
  Model,
  DataTypes,
  Optional,
  Association,
} from 'sequelize';

type MaintenanceStatus = 'OPERATIONAL' | 'MAINTENANCE' | 'OUT_OF_SERVICE';

interface BusAttributes {
  busId: string;
  companyId: string;
  registrationNumber: string;
  model: string;
  seatCapacity: number;
  amenities: string[];
  maintenanceStatus: MaintenanceStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

interface BusCreationAttributes extends Optional<BusAttributes, 'busId' | 'amenities' | 'maintenanceStatus' | 'createdAt' | 'updatedAt'> {}

export function createBusModel(sequelize: any) {
  class Bus extends Model<BusAttributes, BusCreationAttributes> implements BusAttributes {
    public busId!: string;
    public companyId!: string;
    public registrationNumber!: string;
    public model!: string;
    public seatCapacity!: number;
    public amenities!: string[];
    public maintenanceStatus!: MaintenanceStatus;
    public createdAt?: Date;
    public updatedAt?: Date;

    public static associations: {
      company: Association<Bus, any>;
      trips: Association<Bus, any>;
    };
  }

  Bus.init(
    {
      busId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      companyId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'bus_companies',
          key: 'companyId',
        },
      },
      registrationNumber: {
        type: DataTypes.STRING(20),
        unique: true,
        allowNull: false,
      },
      model: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      seatCapacity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
        },
      },
      amenities: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
      },
      maintenanceStatus: {
        type: DataTypes.ENUM('OPERATIONAL', 'MAINTENANCE', 'OUT_OF_SERVICE'),
        defaultValue: 'OPERATIONAL',
      },
    },
    {
      sequelize,
      modelName: 'Bus',
      tableName: 'buses',
      timestamps: true,
      underscored: true,
    }
  );

  return Bus;
}

export { BusAttributes, BusCreationAttributes, MaintenanceStatus };
