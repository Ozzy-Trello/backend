import { DataTypes, Model, Sequelize } from 'sequelize';
import sequelize from '@/database/connections';

interface AutomationRuleFilterAttributes {
    id : string;
    rule_id: string;
    group_type: string;
    type: string;
    condition: Record<string, any>;
    created_at?: Date;
    updated_at?: Date;
}

interface AutomationRuleCreationAttributes extends AutomationRuleFilterAttributes {}

class AutomationRuleFilter extends Model<AutomationRuleFilterAttributes, AutomationRuleCreationAttributes> implements AutomationRuleFilterAttributes {
    public id! : string;
    public rule_id!: string;
    public group_type!: string;
    public type!: string;
    public condition!: Record<string, any>;

    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

AutomationRuleFilter.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    rule_id: {
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
  },
  {
    tableName: 'automation_rule_filter',
    sequelize,
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',    
  }
)

export default AutomationRuleFilter;