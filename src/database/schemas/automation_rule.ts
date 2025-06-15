import { DataTypes, Model, Sequelize } from 'sequelize';
import sequelize from '@/database/connections';

interface AutomationRuleAttributes {
    id : string;
    workspace_id: string;
    group_type: string;
    type: string;
    condition: string;
    created_at?: Date;
    updated_at?: Date;
    created_by?: string;
    updated_by?: string;
}

interface AutomationRuleCreationAttributes extends AutomationRuleAttributes {}

class AutomationRule extends Model<AutomationRuleAttributes, AutomationRuleCreationAttributes> implements AutomationRuleAttributes {
  public id! : string;
  public workspace_id!: string;
  public group_type!: string;
  public type!: string;
  public condition!: string;
  public created_by?: string;
  public updated_by?: string;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

AutomationRule.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    workspace_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    group_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    condition: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    created_at: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    created_by: {
      allowNull: false,
      type: DataTypes.UUID,
    },
    updated_by: {
      allowNull: true,
      type: DataTypes.UUID,
    },
  },
  {
    tableName: 'automation_rule',
    sequelize,
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',    
  }
)

export default AutomationRule;